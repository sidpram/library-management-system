const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');

// import database connection file
const DbConnection = require('./databaseConnection')

const PORT = 8081;

const app = express();
dotenv.config();

DbConnection();
// const {users} = require("./data/users.json")

// importing the routers
const usersRouter = require("./routes/users");
const booksRouter = require("./routes/books");   

// Enable CORS for the frontend dashboard
app.use(cors());
app.use(express.json());

app.get("/", (req, res)=> {
    res.status(200).send('Home Page!');
});

app.use("/users", usersRouter);
app.use("/books", booksRouter);


// app.all('/{*splat}', (req, res)=> {
//     res.status(500).json({
//         message: "Not Build Yet !"
//     })
// });

app.listen(PORT, ()=> {
    console.log(`Server listen to the port : http://localhost:${PORT}`);    
})