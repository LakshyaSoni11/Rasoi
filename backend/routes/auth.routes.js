import express from "express"
import { signUp, signIn, signOut, resetPassword, sendOtp, verifyOtp } from "../controllers/auth.controllers.js"
import { validate } from "../middlewares/validate.js"
import { SignUpSchema, SignInSchema, ResetPasswordSchema, SendOtpSchema, VerifyOtpSchema } from "../utils/schemas.js"

const authRouter = express.Router()

authRouter.post("/signup", validate(SignUpSchema), signUp)
authRouter.post("/signin", validate(SignInSchema), signIn)
authRouter.get("/signout", signOut)
authRouter.post("/verify-otp", validate(VerifyOtpSchema), verifyOtp)
authRouter.post("/reset-password", validate(ResetPasswordSchema), resetPassword)
authRouter.post("/send-otp", validate(SendOtpSchema), sendOtp)

export default authRouter
