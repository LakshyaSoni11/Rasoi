import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()
// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP for password reset",
            html: `<h1>Your OTP is ${otp}. It will expire in 5 minutes</h1>`,
        })
        console.log("Message sent:", info.messageId)
    } catch (error) {
        console.log("Error in sending OTP", error)
    }
}