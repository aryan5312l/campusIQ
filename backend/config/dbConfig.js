require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI not defined in environment");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Database connected...");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = {connectDB};