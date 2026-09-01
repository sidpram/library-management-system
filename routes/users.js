const express = require("express");
const { users } = require("../data/users.json");

const router = express.Router();

/**
 * Route: /users
 * Method: GET
 * Decsription:  Get all the list of users in the system
 * Access: Public
 * Paramters: None
 */
router.get('/',(req, res)=>{
    res.status(200).json({
        success: true,
        data: users
    })
})

/**
 * Route: /users/:id
 * Method: GET
 * Decsription:  Get a user by their ID
 * Access: Public
 * Paramters: id
 */
router.get('/:id', (req, res)=> {

    const {id} = req.params;
    const user = users.find((each)=>each.id === id)

    if(!user){
      return  res.status(404).json({
            success: false,
            message: `User Not Found for id: ${id}`
        })
    }

    res.status(200).json({
        success: true,
        data: user
    })
})


/**
 * Route: /users
 * Method: POST
 * Decsription:  Create/Register a new user
 * Access: Public
 * Paramters: None
 */
router.post('/', (req, res)=>{
    // req.body should have the following fields
    const {id, name, surname, email, subscriptionType , subscriptionDate } = req.body;

    // Check if all the required fields are present
    if(!id || !name || !surname || !email || !subscriptionType || !subscriptionDate){  
        return res.status(400).json({
            success: false,
            message: "Please provide all the required fields"
        })
     }

    // Check if the user already exists
    const user = users.find((each)=>each.id === id)
    if(user){
        return res.status(409).json({
            success: false,
            message: `User Already Exists with id: ${id}` 
        })
    }

    // If all checks pass, create the user
    // and push it to the users array
   users.push({id, name, surname, email, subscriptionType , subscriptionDate })

   res.status(201).json({
       success: true,
       message: "User Created Successfully"
   })

})


/**
 * Route: /users/:id
 * Method: PUT
 * Decsription:  Updating a user by their ID
 * Access: Public
 * Paramters: ID
 */
router.put('/:id', (req, res)=> {
    const {id} = req.params;
    const {data} = req.body;

    // Check if the user exists
    const user = users.find((each)=>each.id === id)
   if(!user){
       return res.status(404).json({
           success: false,
           message: `User Not Found for id: ${id}`
       })
   }

//    Object.assign(user, data);
// With Spread Operator
    const updatedUser = users.map((each)=>{
        if(each.id===id){
            return {
                ...each,
                ...data,
            }
        }
        return each
    })

   res.status(200).json({
       success: true,
       data: updatedUser,
       message: "User Updated Successfully"
   })
})

/**
 * Route: /users/:id
 * Method: Delete
 * Decsription:  Deleting a user by their ID
 * Access: Public
 * Paramters: ID
 */
router.delete('/:id', (req, res)=> {
    const {id} = req.params;

    // Check if the user exists
    const user = users.find((each)=>each.id === id)
   if(!user){
       return res.status(404).json({
           success: false,
           message: `User Not Found for id: ${id}`
       })
   }

   // If user exists, filter it out from the users array
   const updatedUsers = users.filter((each)=>each.id !== id)

//    2nd method
//    const index = users.indexOf(user);
//    users.splice(index, 1);

   res.status(200).json({
       success: true,
       data: updatedUsers,
       message: "User Deleted Successfully"
   })
});

/**
 * Route: /users/subscription-details/:id
 * Method: GET
 * Decsription:  Get all the subscription details of a user by their ID
 * Access: Public
 * Paramters: ID
 */
router.get('/subscription-details/:id', (req, res) => {
    const { id } = req.params;

    // Find the user by ID
    const user = users.find((each) => each.id === id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: `User Not Found for id: ${id}`
        });
    }

    // Extract the subscription details
    const getDateInDays = (data = '') =>{
        let date;
        if(data){
            date = new Date(data);
        }else{
            date = new Date();
        }
        let days = Math.floor( date/ (1000 * 60 * 60 * 24));
        return days;
    }

    const subscriptionType = (date) => {
        if(user.subscriptionType === "Basic"){
            date = date + 90
        }else if(user.subscriptionType === "Standard"){
            date = date + 180
    }else if(user.subscriptionType === "Premium"){
            date = date + 365
        }
        return date;
    }

    // Subscription Expiration Calculation 
    // January 1, 1970 UTC // milliseconds

    let returnDate = getDateInDays(user.returnDate);
    let currentDate = getDateInDays();
    let subscriptionDate = getDateInDays(user.subscriptionDate);
    let subscriptionExpiration = subscriptionType(subscriptionDate);

    const data = {
        ...user,
        subscriptionExpired: subscriptionExpiration < currentDate,
        subscriptionDaysLeft: subscriptionExpiration - currentDate,
        daysLeftForExpiration: returnDate - currentDate,
        returnDate: returnDate < currentDate ? "Book is overdue" : returnDate,
        fine: returnDate < currentDate ? subscriptionExpiration <= currentDate ? 200 : 100 : 0
    }

    res.status(200).json({
        success: true,
        data
    });
});

module.exports = router;