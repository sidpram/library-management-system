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
	const user = await UserModel.findById(id).populate("issuedBook");

	if (!user) {
		return res.status(404).json({ success: false, message: `User Not Found for id: ${id}` });
	}

	res.status(200).json({ success: true, data: user });
};

exports.getAllUsersWithIssuedBooks = async (req, res) => {
	const usersWithIssuedBooks = await UserModel.find({ issuedBook: { $exists: true } }).populate("issuedBook");

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

	const returnDate = getDateInDays(user.returnDate);
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