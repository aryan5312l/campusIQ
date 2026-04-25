const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please add a Password"],
        select: false
    },
    studentId: {
        type: String,
        required: [true, "Please add your ID"],
        unique: true
    },
    dob: {
        type: String,
        required: [true, "Please add DOB"]
    }
}, {timestamps: true});

module.exports = mongoose.model("User", UserSchema);