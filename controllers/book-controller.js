const { UserModel, BookModel } = require("../models/index");
const booksdto = require("../dtos/book-dto");

// router.get('/',(req, res)=>{
//     res.status(200).json({
//         success: true,
//         data: books
//     })
// })

exports.getAllBooks = async(req, res) =>{

    const books = await BookModel.find()

    if(books.length === 0){
        return res.status(404).json({
            success: false,
            message: "No book found in the system"
        })
    }

    res.status(200).json({
        success: true,
        data: books
    })
 
}

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

exports.getBookById = async( req, res) =>{
    const {id} = req.params;
    const books = await BookModel.findById(id)
    
    if(!books){
        return res.status(404).json({
            success: false,
            message: `No book found in the system ${id}`
        })
    }

    res.status(200).json({
        success: true,
        data: books
    })
    
}

// router.get('/issued/for-users', (req, res) => {
//     // const issuedBooks = books.filter((each) => each.issued === true);

//     const usersWithIssuedBooks = users.filter((each)=>{
//         if(each.issuedBook) {
//             return each;
//         }
//     })

//     const issuedBooks = [];
  
//     usersWithIssuedBooks.forEach((each)=>{
//         const book = books.find((book)=> book.id ===each.issuedBook);

//         book.issuedBy = each.name;
//         book.issuedDate = each.issuedDate;
//         book.returnDate = each.returnDate;

//         issuedBooks.push(book)
//     })

//     if(!issuedBooks === 0){
//         return res.status(404).json({
//             success: false,
//             message: "No Books issued yet"
//         })
//     }

//     res.status(200).json({
//         success: true,
//         data: issuedBooks
//     });
// });

exports.getAllIssuedBooks = async( req, res) =>{

    const usersWithIssuedBooks = await UserModel.find({
        issuedBook : {$exists : true}
    }).populate("issuedBook");

    const issuedBooks = usersWithIssuedBooks.map((each)=>{
       return new booksdto(each.issuedBook);
    });

    if(issuedBooks.length === 0){
        return res.status(404).json({
            success: false,
            message: "No Books issued yet"
        })
    }
    res.status(200).json({
        success: true,
        data: issuedBooks
    });  

}


exports.addNewBook = async(req, res) =>{
    try {
        let data = req.body || {};

        // unwrap payloads that nest the actual object inside a `data` property
        if (data.data && typeof data.data === 'object') data = data.data;

        // support older clients that may send `name` instead of `title`
        if (data.name && !data.title) data.title = data.name;

        const requiredFields = ["title", "author", "genre", "price", "publisher"];
        const missing = requiredFields.filter((f) => !data[f]);

        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(", ")}`
            });
        }

        const book = await BookModel.create(data);
        res.status(201).json({
            success: true,
            data: book
        });
    } catch (error) {
        // If Mongoose validation still fails, surface a clear message
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Failed to create book', error: error.message });
    }
}

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

exports.updateBookById = async(req, res) =>{
    const {id} = req.params;
    const data = req.body;

    const book = await BookModel.findByIdAndUpdate(id, data, { new: true });

    if (!book) {
        return res.status(404).json({
            success: false,
            message: `Book Not Found for id: ${id}`
        });
    }

    res.status(200).json({
        success: true,
        message: "Book Updated Successfully",
        data: book
    });
}

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

exports.deleteBookById = async(req, res) =>{
    const {id} = req.params;

    const book = await BookModel.findByIdAndDelete(id);

    if (!book) {
        return res.status(404).json({
            success: false,
            message: `Book Not Found for id: ${id}`
        });
    }

    res.status(200).json({
        success: true,
        message: "Book Deleted Successfully",
        data: book
    });
}
