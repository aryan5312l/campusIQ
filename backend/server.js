const express = require("express");
const {connectDB}  = require("./config/dbConfig");
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware to parse JSON body
app.use(express.json());


app.get("/", (req, res) => {
    res.send("ALL is working fine");
})


//Start Server
const startServer = async() => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on PORT ${PORT}`);
        })
    } catch (error) {
        console.error("Failed to start the server: ", error.message);
        process.exit(1);
    }
}

startServer();

