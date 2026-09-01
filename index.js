const express = require("express");

const PORT = 8081;

const app = express();

app.use(express.json());

app.get('/', (req, res)=>{
    res.status(200).send('Home Page!');
});


app.all('/{*splat}', (req, res)=> {
    res.status(500).json({
        message: "Not Build Yet !"
    })
});

app.listen(PORT, ()=> {
    console.log(`Server listen to the port : http://localhost:${PORT}`);    
})