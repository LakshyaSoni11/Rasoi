import jwt from "jsonwebtoken"
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
        console.log("Auth Error:", error.message);
        return res.status(500).json({ message: "Internal server error" })
    }
}