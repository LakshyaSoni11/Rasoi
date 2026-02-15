import mongoose from "mongoose";
const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB connected")
    } catch (error) {
        console.log("MongoDB connection error", error)
    }
}
export default connectDb
