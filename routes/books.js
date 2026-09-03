const express = require("express");
const { books } = require("../data/books.json");
const { users } = require("../data/users.json");

const { UserModel, BookModel } = require("../models/index");
const { getAllBooks, getBookById, getAllIssuedBooks, addNewBook, updateBookById, deleteBookById } = require("../controllers/book-controller");

const router = express.Router();


/**
 * Route: /books
 * Method: GET
 * Decsription:  Get all the list of books in the system
 * Access: Public
 * Paramters: None
 */
router.get('/', getAllBooks)


/**
 * Route: /books/:id
 * Method: GET
 * Decsription:  Get a book by its ID
 * Access: Public
 * Paramters: id
 */
// router.get('/:id', (req, res)=> {

//     const {id} = req.params;
//     const book = books.find((each)=>each.id === id)

//     if(!book){
//       return  res.status(404).json({
//             success: false,
//             message: `Book Not Found for id: ${id}`
//         })
//     }

//     res.status(200).json({
//         success: true,
//         data: book
//     })
// })  
router.get('/:id', getBookById)

/**
 * Route: /books
 * Method: POST
 * Decsription:  Create/Register a new book
 * Access: Public
 * Paramters: None
 */
// router.post('/', (req, res)=>{
//     // req.body should have the following fields
//     const {id, name, author, genre, price, publisher } = req.body;

//     // Check if all the required fields are present
//     if(!id || !name || !author || !genre || !price || !publisher){  
//         return res.status(400).json({
//             success: false,
//             message: "Please provide all the required fields"
//         })
//     }

//     // Check if the book already exists
//     const book = books.find((each)=>each.id === id)
//     if(book){
//         return res.status(409).json({
//             success: false,
//             message: `Book Already Exists with id: ${id}` 
//         })
//     }

//     // Add the new book to the books array
//     books.push({id, name, author, genre, price, publisher});

//     res.status(201).json({
//         success: true,
//         message: "Book added successfully",
//         data: {id, name, author, genre, price, publisher}
//     })          
// })
router.post('/', addNewBook);

/**
 * Route: /books/:id
 * Method: PUT
 * Decsription:  Update a book by its ID
 * Access: Public
 * Paramters: id
 */
// router.put('/:id', (req, res) => {
//     const { id } = req.params;
//     const { data } = req.body;

//     // if(!data || Object.keys(data).length === 0){
//     //     return res.status(400).json({
//     //         success: false,
//     //         message: "Please provide the data to update"
//     //     })
//     // }

//     // Check if the book exists
//     const book = books.find((each) => each.id === id)
//     if (!book) {
//         return res.status(404).json({
//             success: false,
//             message: `Book Not Found for id: ${id}`
//         })
//     }

//     // Update the book details
//     //    Object.assign(book, data);

//     const updatedBook = books.map((each) => {
//         if (each.id === id) {
//             return { ...each, ...data };
//         }
//         return each;
//     });

//     res.status(200).json({
//         success: true,
//         message: "Book Updated Successfully",
//         data: updatedBook
//     })
// })
router.put('/:id', updateBookById)

/**
 * Route: /books/:id
 * Method: DELETE
 * Decsription:  Delete a book by its ID
 * Access: Public
 * Paramters: id
 */
// router.delete('/:id', (req, res) => {
//     const { id } = req.params;

//     // Check if the book exists
//     const book = books.find((each) => each.id === id)
//     if (!book) {
//         return res.status(404).json({
//             success: false,
//             message: `Book Not Found for id: ${id}`
//         })
//     }

//     // Delete the book from the books array
//     const updatedBooks = books.filter((each) => each.id !== id);

//     res.status(200).json({
//         success: true,
//         message: "Book Deleted Successfully",
//         data: updatedBooks
//     })
// })
router.delete('/:id', deleteBookById)

/**
 * Route: /books/issued/for-users
 * Method: GET
 * Decsription:  Get all issued books
 * Access: Public
 * Paramters: None
 */
router.get('/issued/for-users', getAllIssuedBooks);

module.exports = router;