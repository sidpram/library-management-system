const { UserModel, BookModel } = require("../models/index");

exports.getAllUsers = async (req, res) => {
	const users = await UserModel.find();

	if (!users || users.length === 0) {
		return res.status(404).json({ success: false, message: "No users found" });
	}

	res.status(200).json({ success: true, data: users });
};

exports.getUserById = async (req, res) => {
	const { id } = req.params;
	const user = await UserModel.findById(id).populate("issuedBooks.book");

	if (!user) {
		return res.status(404).json({ success: false, message: `User Not Found for id: ${id}` });
	}

	res.status(200).json({ success: true, data: user });
};

exports.getAllUsersWithIssuedBooks = async (req, res) => {
	const usersWithIssuedBooks = await UserModel.find({ 'issuedBooks.0': { $exists: true } }).populate("issuedBooks.book");

	if (!usersWithIssuedBooks || usersWithIssuedBooks.length === 0) {
		return res.status(404).json({ success: false, message: "No users with issued books" });
	}

	res.status(200).json({ success: true, data: usersWithIssuedBooks });
};

exports.addNewUser = async (req, res) => {
	try {
		let data = req.body || {};
		if (data.data && typeof data.data === "object") data = data.data;

		const required = ["name", "surname", "email", "subscriptionType", "subscriptionDate"];
		const missing = required.filter((f) => !data[f]);
		if (missing.length > 0) {
			return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });
		}

		const user = await UserModel.create(data);
		res.status(201).json({ success: true, data: user });
	} catch (error) {
		if (error.name === "ValidationError") {
			return res.status(400).json({ success: false, message: error.message });
		}
		if (error.code === 11000) {
			// duplicate key (unique email) error
			return res.status(409).json({ success: false, message: "Email already exists" });
		}
		res.status(500).json({ success: false, message: "Failed to create user", error: error.message });
	}
};

exports.updateUserById = async (req, res) => {
	const { id } = req.params;
	let data = req.body || {};
	if (data.data && typeof data.data === "object") data = data.data;

	const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
	if (!user) return res.status(404).json({ success: false, message: `User Not Found for id: ${id}` });
	res.status(200).json({ success: true, message: "User Updated Successfully", data: user });
};

exports.deleteUserById = async (req, res) => {
	const { id } = req.params;
	const user = await UserModel.findByIdAndDelete(id);
	if (!user) return res.status(404).json({ success: false, message: `User Not Found for id: ${id}` });
	res.status(200).json({ success: true, message: "User Deleted Successfully", data: user });
};

exports.getSubscriptionDetails = async (req, res) => {
	const { id } = req.params;
	const user = await UserModel.findById(id);
	if (!user) return res.status(404).json({ success: false, message: `User Not Found for id: ${id}` });

	const getDateInDays = (data = "") => {
		let date;
		if (data) date = new Date(data);
		else date = new Date();
		return Math.floor(date / (1000 * 60 * 60 * 24));
	};

	const subscriptionType = (dateVal) => {
		if (user.subscriptionType === "Basic") return dateVal + 90;
		if (user.subscriptionType === "Standard") return dateVal + 180;
		if (user.subscriptionType === "Premium") return dateVal + 365;
		return dateVal;
	};

	const firstIssued = user.issuedBooks && user.issuedBooks.length ? user.issuedBooks[0] : null;
	const returnDate = getDateInDays(firstIssued && firstIssued.returnDate ? firstIssued.returnDate : '');
	const currentDate = getDateInDays();
	const subscriptionDate = getDateInDays(user.subscriptionDate);
	const subscriptionExpiration = subscriptionType(subscriptionDate);

	const data = {
		...user.toObject(),
		subscriptionExpired: subscriptionExpiration < currentDate,
		subscriptionDaysLeft: subscriptionExpiration - currentDate,
		daysLeftForExpiration: returnDate - currentDate,
		returnDate: returnDate < currentDate ? "Book is overdue" : returnDate,
		fine: returnDate < currentDate ? (subscriptionExpiration <= currentDate ? 200 : 100) : 0,
	};

	res.status(200).json({ success: true, data });
};

exports.issueBookToUser = async (req, res) => {
	try {
		const { id } = req.params;
		let body = req.body || {};
		if (body.data && typeof body.data === 'object') body = body.data;
		const { bookId, issuedDate, returnDate } = body;

		const user = await UserModel.findById(id);
		if (!user) return res.status(404).json({ success: false, message: `User Not Found for id: ${id}` });
		const book = await BookModel.findById(bookId);
		if (!book) return res.status(404).json({ success: false, message: `Book Not Found for id: ${bookId}` });

		// ensure book is not already issued to another user
		const holder = await UserModel.findOne({ 'issuedBooks.book': bookId });
		if (holder) return res.status(400).json({ success: false, message: 'Book is already issued to another user' });

		// ensure user doesn't already have the same book
		if (user.issuedBooks && user.issuedBooks.find(e => e.book && e.book.toString() === bookId)) {
			return res.status(400).json({ success: false, message: 'User already has this book issued' });
		}

		user.issuedBooks = user.issuedBooks || [];
		user.issuedBooks.push({ book: book._id, issuedDate: issuedDate ? new Date(issuedDate) : new Date(), returnDate: returnDate ? new Date(returnDate) : undefined });

		await user.save();
		const populated = await UserModel.findById(user._id).populate('issuedBooks.book');
		res.status(200).json({ success: true, data: populated });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Failed to issue book', error: error.message });
	}
};

exports.returnBookFromUser = async (req, res) => {
	try {
		const { id } = req.params;
		let body = req.body || {};
		if (body.data && typeof body.data === 'object') body = body.data;
		const { bookId } = body;

		if (!bookId) return res.status(400).json({ success: false, message: 'bookId is required to return a specific book' });

		const user = await UserModel.findById(id);
		if (!user) return res.status(404).json({ success: false, message: `User Not Found for id: ${id}` });

		const has = user.issuedBooks && user.issuedBooks.find(e => e.book && e.book.toString() === bookId);
		if (!has) return res.status(400).json({ success: false, message: 'User does not have this book issued' });

		user.issuedBooks = user.issuedBooks.filter(e => !(e.book && e.book.toString() === bookId));
		await user.save();
		res.status(200).json({ success: true, data: user });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Failed to return book', error: error.message });
	}
};