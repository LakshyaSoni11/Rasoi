import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
    },
    mobile:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["user","owner", "deliveryBoy", "admin"],
        default:"user",
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    resetOtp:{
        type:String
    },
    isOtpVerified:{
        type:Boolean,
        default:false
    },
    otpExpires:{
        type:Date
    },
    socketId:{
        type:String,
        default:""
    },
    isOnline:{
        type:Boolean,
        default:false
    },
    //geojson format
    location:{
        type: {type:String, enum:["Point"], default:"Point"},
        coordinates:{
            type:[Number],
            required:true,
            default:[0,0]
        }
    }
},{timestamps:true})
userSchema.index({location:"2dsphere"})
const User = mongoose.model("User", userSchema)
export default User