import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
    try {
        const { name, city, address } = req.body;

        // Basic validation
        if (!name || !city || !address) {
            return res.status(400).json({ message: "Name, city and address are required" })
        }

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }

        let shop = await Shop.findOne({ owner: req.userId })

        if (!shop) {
            // Creation logic
            if (!image) {
                return res.status(400).json({ message: "Image is required for shop creation" })
            }
            shop = await Shop.create({ name, image, owner: req.userId, city, address });
            await shop.populate("owner", "fullName email") // Populate specific fields
            return res.status(201).json({ message: "Shop created successfully", shop });
        } else {
            // Update logic
            const updateFields = { name, city, address };
            if (image) updateFields.image = image;

            shop = await Shop.findOneAndUpdate(
                { owner: req.userId },
                updateFields,
                { new: true }
            );
            await shop.populate([
                { path: "owner" },
                { path: "items", options: { sort: { updatedAt: -1 } } }
            ])
            return res.status(200).json({ message: "Shop updated successfully", shop });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(200).json({ shop: null })
        }
        await shop.populate([
            { path: "owner" },
            { path: "items", options: { sort: { updatedAt: -1 } } }
        ])
        res.status(200).json({ shop })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const getShopsByCity = async (req, res) =>{
    try {
        const {city} = req.params
        if(!city){
            return res.status(400).json({message:"City is required"})
        }
        const shop = await Shop.find({
            city:{$regex:new RegExp(`^${city}$`, "i")}
        }).populate("items")
        if(!shop){
            return res.status(400).json({message:"No shops found in this city"})
        }
        return res.status(200).json({shop})
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Get shop by city Error"})
    }
}