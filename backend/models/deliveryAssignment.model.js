import mongoose from "mongoose";
const deliveryAssignmentSchema = new mongoose.Schema({
    Order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    },
    shop:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Shop"
    },
    broadcastedTo:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    shopOrderId:{
        type:mongoose.Schema.Types.ObjectId,
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum:["broadcasted","assigned","delivered"],
        default:"broadcasted"
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    acceptedAt:{
        type:Date,
        default:null
    }
},{timestamps:true})

const DeliveryAssignment = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema)
export default DeliveryAssignment