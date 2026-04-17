import mongoose from "mongoose"

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    category: {
        type: String,
        enum: [
            "Pizza",
            "Burgers",
            "Pasta",
            "Indian",
            "Chinese",
            "South Indian",
            "North Indian",
            "Fast Food",
            "Desserts",
            "Beverages",
            "Street Food",
            "Healthy",
            "Snacks",
            "Vegetarian",
            "Non-Vegetarian",
            "Others"
        ],
        required: true
    },
    price:{
        type:Number,
        min:0,
        required:true
    },
    discountPrice:{
        type:Number,
        min:0,
        default:0
    },
    foodType:{
        type:String,
        enum:["Veg","Non-Veg"],
        required:true
    },
    isBestSeller:{
        type:Boolean,
        default:false
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    rating:{
        average:{
            type:Number,
            min:0,
            max:5,
            default:0
        },
        count:{
            type:Number,
            min:0,
            default:0
        }
    },
    reviews:{
        type:Number,
        min:0,
        default:0
    }

},{timestamps:true})

const Item = mongoose.model("Item", itemSchema)
export default Item