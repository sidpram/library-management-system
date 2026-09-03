const { UserModel, BookModel } = require('../models/index');

// Get users who have the given book in their issuedBooks array
exports.getSubscribersForBook = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await UserModel.find({ 'issuedBooks.book': id })
      .select('name surname email issuedBooks subscriptionType subscriptionDate')
      .populate('issuedBooks.book')
      .lean();

    if (!users || users.length === 0) return res.status(200).json({ success: true, data: [] });

    const subs = [];
    users.forEach(u => {
      (u.issuedBooks || []).forEach(rec => {
        const bookId = rec.book && (rec.book._id || rec.book).toString();
        if (bookId === id.toString()) {
          subs.push({ name: u.name, surname: u.surname, email: u.email, issuedDate: rec.issuedDate, returnDate: rec.returnDate });
        }
      });
    });

    return res.status(200).json({ success: true, data: subs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subscribers', error: error.message });
  }
};

// Return all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await BookModel.find();
    return res.status(200).json({ success: true, data: books });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch books', error: error.message });
  }
};

// Get book by id
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await BookModel.findById(id);
    if (!book) return res.status(404).json({ success: false, message: `No book found in the system ${id}` });
    return res.status(200).json({ success: true, data: book });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch book', error: error.message });
  }
};

// Return flattened list of all issued book entries across users
exports.getAllIssuedBooks = async (req, res) => {
  try {
    const usersWithIssuedBooks = await UserModel.find({ 'issuedBooks.0': { $exists: true } }).populate('issuedBooks.book').lean();
    const issuedBooks = [];
    usersWithIssuedBooks.forEach(user => {
      (user.issuedBooks || []).forEach(rec => {
        if (rec.book) {
          issuedBooks.push({
            _id: rec.book._id,
            title: rec.book.title || rec.book.name,
            author: rec.book.author,
            genre: rec.book.genre,
            price: rec.book.price,
            publisher: rec.book.publisher,
            issuedBy: `${user.name || ''} ${user.surname || ''}`.trim(),
            issuedDate: rec.issuedDate,
            returnDate: rec.returnDate
          });
        }
      });
    });

    if (issuedBooks.length === 0) return res.status(404).json({ success: false, message: 'No Books issued yet' });
    return res.status(200).json({ success: true, data: issuedBooks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch issued books', error: error.message });
  }
};

// Create a new book with basic validation
exports.addNewBook = async (req, res) => {
  try {
    let data = req.body || {};
    if (data.data && typeof data.data === 'object') data = data.data; // unwrap payloads
    if (data.name && !data.title) data.title = data.name;

    const requiredFields = ['title', 'author', 'genre', 'price', 'publisher'];
    const missing = requiredFields.filter(f => !data[f]);
    if (missing.length > 0) return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });

    const book = await BookModel.create(data);
    return res.status(201).json({ success: true, data: book });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Failed to create book', error: error.message });
  }
};

// Update book by id
exports.updateBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const book = await BookModel.findByIdAndUpdate(id, data, { new: true });
    if (!book) return res.status(404).json({ success: false, message: `Book Not Found for id: ${id}` });
    return res.status(200).json({ success: true, message: 'Book Updated Successfully', data: book });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update book', error: error.message });
  }
};

// Delete book by id
exports.deleteBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await BookModel.findByIdAndDelete(id);
    if (!book) return res.status(404).json({ success: false, message: `Book Not Found for id: ${id}` });
    return res.status(200).json({ success: true, message: 'Book Deleted Successfully', data: book });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete book', error: error.message });
  }
};
