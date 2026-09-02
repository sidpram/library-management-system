const UserModel = require('./user-model');
const BookModel = require('./book-models');

module.exports = {
    UserModel,
    BookModel
};

//This file is used to export the models so that they can be easily imported in other parts of the 
// application. The UserModel and BookModel are defined in their respective files 
// (user.js and book-models.js) and are then exported as properties of an object. 
// This allows for a cleaner and more organized way to manage the models in the application.