import jwt from "jsonwebtoken"

const genToken = async (userId) =>{
    try {
        const token = await jwt.sign({id:userId}, process.env.JWT_SECRET, {expiresIn:"15d"})
        return token
    } catch (error) {
        console.log("Error in token generation", error)
    }
}
export default genToken