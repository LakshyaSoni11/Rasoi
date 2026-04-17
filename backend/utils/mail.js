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
    } catch (error) {
    }
}

export const sendDeliveryOtpMail = async (email, otp, orderId) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: `OTP for Order #${orderId?.slice(-6)} Delivery`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #ff4d2d;">Order Delivery Verification</h2>
                    <p>Hello,</p>
                    <p>Your delivery boy is at your location. Please provide this OTP to complete the delivery for <strong>Order #${orderId?.slice(-6)}</strong>:</p>
                    <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>Enjoy your meal!</p>
                </div>
            `,
        })
    } catch (error) {
        console.error("Nodemailer error:", error);
    }
}