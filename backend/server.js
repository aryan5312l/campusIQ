const express = require("express");
const cors = require("cors");
const {connectDB}  = require("./config/dbConfig");
const syncRoutes = require("./routes/syncRoutes")
const authRoutes = require("./routes/authRoutes");
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware to parse JSON body
app.use(cors({
    origin: "https://nieiq.onrender.com",
    credentials: true
}));
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api", syncRoutes);




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

