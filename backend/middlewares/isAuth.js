import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
export const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token
        // console.log("Token received:", token ? "Yes" : "No");
        if (!token) {
            return res.status(400).json({ message: "Unauthorized: No token provided" })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        // console.log("Token decoded:", decodedToken);
        req.userId = decodedToken.id
        next()
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admin access required" })
        }
        next()
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}