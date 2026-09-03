const mongoose = require('mongoose');

// "id": "1",
//         "name": "John",
//         "surname": "Doe",
//         "email": "user@email.com",
//         "issuedBook": "1",
//         "issuedDate": "04/01/2022",
//         "returnDate": "05/01/2022",
//         "subscriptionType": "Premium",
//         "subscriptionDate": "04/01/2022"


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        surname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        issuedBooks: [
            {
                book: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Book'
                },
                issuedDate: {
                    type: Date,
                    required: false
                },
                returnDate: {
                    type: Date,
                    required: false
                }
            }
        ],
        subscriptionType: {
            type: String,
            required: true
        },
        subscriptionDate: {
            type: String,
            required: true
        },
        
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);