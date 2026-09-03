const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    getAllUsersWithIssuedBooks,
    addNewUser,
    updateUserById,
    deleteUserById,
    getSubscriptionDetails,
} = require("../controllers/user-controller");

/**
 * Route: /users
 * Method: GET
 * Decsription:  Get all the list of users in the system
 * Access: Public
 * Paramters: None
 */
router.get('/', getAllUsers)

/**
 * Route: /users/:id
 * Method: GET
 * Decsription:  Get a user by their ID
 * Access: Public
 * Paramters: id
 */
router.get('/:id', getUserById)


/**
 * Route: /users
 * Method: POST
 * Decsription:  Create/Register a new user
 * Access: Public
 * Paramters: None
 */
router.post('/', addNewUser)


/**
 * Route: /users/:id
 * Method: PUT
 * Decsription:  Updating a user by their ID
 * Access: Public
 * Paramters: ID
 */
router.put('/:id', updateUserById)

/**
 * Route: /users/:id
 * Method: Delete
 * Decsription:  Deleting a user by their ID
 * Access: Public
 * Paramters: ID
 */
router.delete('/:id', deleteUserById)

/**
 * Route: /users/subscription-details/:id
 * Method: GET
 * Decsription:  Get all the subscription details of a user by their ID
 * Access: Public
 * Paramters: ID
 */
router.get('/subscription-details/:id', getSubscriptionDetails);

// Optional: list users who have issued books
router.get('/issued/for-users', getAllUsersWithIssuedBooks);

module.exports = router;