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
        issuedDate: {
            type: String,
            required: false
        },
        returnDate: {
            type: String,
            required: false
        },
        subscriptionType: {
            type: String,
            required: true
        },
        subscriptionDate: {
            type: String,
            required: true
        },
        issuedBook: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);