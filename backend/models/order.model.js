import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    isRated: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    assignedDeliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    shopOrderItems: [shopOrderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "preparing", "out of delivery", "delivered"],
        default: "pending"
    },

    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"DeliveryAssignment",
        default:null
    },
    assignedDeliveryBoy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    }
 
}, { timestamps: true })

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "online"],
        required: true
    },
    deliveryAddress: {
        flatNo: {
            type: String
        },
        street: {
            type: String,
            required: true
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    razorpayOrderId: {
        type: String,
        default: ""
    },
    razorpayPaymentId: {
        type: String,
        default: ""
    },
    shopOrder: [shopOrderSchema]


}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema)
export default Order