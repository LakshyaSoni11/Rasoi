import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    city:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    items:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Item"
    }],
    location:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point"
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    openingTime:{
        type:String,
        default:"09:00"
    },
    closingTime:{
        type:String,
        default:"22:00"
    },
    isVerified:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

shopSchema.index({ location: "2dsphere" });

const Shop = mongoose.model("Shop", shopSchema)
export default Shop