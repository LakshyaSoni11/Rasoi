import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
    try {
        const { name, city, address, latitude, longitude, openingTime, closingTime } = req.body;
        
        // Basic validation
        if (!name || !city || !address) {
            return res.status(400).json({ message: "Name, city and address are required" })
        }

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }

        let shop = await Shop.findOne({ owner: req.userId })

        const latFloat = parseFloat(latitude);
        const lonFloat = parseFloat(longitude);

        // Check specifically for NaN or invalid numbers
        const location = (!isNaN(latFloat) && !isNaN(lonFloat)) ? {
            type: "Point",
            coordinates: [lonFloat, latFloat] // GeoJSON is [longitude, latitude]
        } : undefined;
        
        if (!shop) {
            // Creation logic
            if (!image) {
                return res.status(400).json({ message: "Image is required for shop creation" })
            }
            shop = await Shop.create({ name, image, owner: req.userId, city, address, location, openingTime, closingTime });
            await shop.populate("owner", "fullName email") // Populate specific fields
            
            const io = req.app.get("io");
            if(io) io.emit("shopUpdate", { shopId: shop._id });
            
            return res.status(201).json({ message: "Shop created successfully", shop });
        } else {
            // Update logic
            const updateFields = { name, city, address };
            if (openingTime) updateFields.openingTime = openingTime;
            if (closingTime) updateFields.closingTime = closingTime;
            if (image) updateFields.image = image;
            if (location) updateFields.location = location;

            shop = await Shop.findOneAndUpdate(
                { owner: req.userId },
                updateFields,
                { returnDocument: 'after' }
            );
            await shop.populate([
                { path: "owner" },
                { path: "items", options: { sort: { updatedAt: -1 } } }
            ])
            
            const io = req.app.get("io");
            if(io) io.emit("shopUpdate", { shopId: shop._id });
            
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
        // Trim city and use partial match to tolerate small inconsistencies (e.g., "Bengaluru " instead of "Bengaluru")
        const cleanCity = city.trim();
        const shop = await Shop.find({
            city: { $regex: new RegExp(cleanCity, "i") },
            isVerified: true
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

export const getShopById = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId).populate([
            { path: "owner", select: "fullName mobile email" },
            { path: "items", options: { sort: { updatedAt: -1 } } }
        ]);
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }
        res.status(200).json({ shop });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}