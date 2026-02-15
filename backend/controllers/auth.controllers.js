import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";
export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;
        if (!fullName || !email || !password || !mobile || !role) {
            return res.status(400).json({ message: "All fields are required" })
        }
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already exists" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" })
        }
        if (mobile.length < 10) {
            return res.status(400).json({ message: "Mobile number must be at least 10 digits long" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            mobile, role
        })
        const token = await genToken(user._id)
        res.cookie("token", token, {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        return res.status(201).json({ message: "User created successfully", user })
    } catch (error) {
        console.log("Error in sign up", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exists" })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" })
        }
        const token = await genToken(user._id)
        res.cookie("token", token, {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        return res.status(200).json({ message: "User signed in successfully", user })
    } catch (error) {
        console.log("Error in sign in", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "User signed out successfully" })
    } catch (error) {
        console.log("Error in sign out", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User does not exists" })
        }
        const otp = Math.floor(100000 + Math.random() * 900000)
        user.resetOtp = otp
        user.otpExpires = Date.now() + 5 * 60 * 1000
        user.isOtpVerified = false
        await user.save()
        sendOtpMail(email, otp)
        return res.status(200).json({ message: "Otp sent successfully" })
    } catch (error) {
        console.log("Error in send otp", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const verifyOtp = async (req, res) =>{
    try {
        const {email, otp} = req.body;
        if(!email || !otp){
            return res.status(400).json({message:"Email and otp are required"})
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User does not exists"})
        }
        if(user.resetOtp != otp){
            return res.status(400).json({message:"Invalid otp"})
        }
        if(Date.now() > user.otpExpires){
            return res.status(400).json({message:"Otp expired"})
        }
        user.isOtpVerified = true
        user.resetOtp = null
        user.otpExpires = null
        await user.save()
        return res.status(200).json({message:"Otp verified successfully"})
    } catch (error) {
        console.log("Error in verify otp", error)
        return res.status(500).json({message:"Internal server error"})
    }
}

export const resetPassword = async (req, res) =>{
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"Email and password are required"})
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User does not exists"})
        }
        if(!user.isOtpVerified){
            return res.status(400).json({message:"Otp is not verified"})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        user.resetOtp = null
        user.otpExpires = null
        user.isOtpVerified = false
        await user.save()
        return res.status(200).json({message:"Password reset successfully"})
    } catch (error) {
        console.log("Error in reset password", error)
        return res.status(500).json({message:"Internal server error"})
    }
}