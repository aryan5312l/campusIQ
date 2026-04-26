const User = require("../models/userModel");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign({id: user._id, name: user.name}, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};

//Register
const register = async(req, res) => {
    try {
        const {name, email, password, studentId, dob} = req.body;

        if(!name || !email || !password || !studentId || !dob){
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const userExist = await User.findOne({email});
        if(userExist){
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            studentId,
            dob
        });

        const token = generateToken(user);

        res.status(200).json({
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({message: "Register Failed"});
    }
}

//LOGIN
const login = async(req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email}).select("+password");

        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({message: "Login failed"});
    };
}

module.exports = {register, login};