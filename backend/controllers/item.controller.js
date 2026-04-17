import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
    try {
        const { name, category, price, foodType, isBestSeller, discountPrice } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        let shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" })
        }
        const item = await Item.create({ 
            name, 
            category, 
            price: Number(price), 
            foodType, 
            isBestSeller: isBestSeller === 'true' || isBestSeller === true,
            discountPrice: Number(discountPrice) || 0,
            image, 
            shop: shop._id 
        })

        shop = await Shop.findByIdAndUpdate(shop._id, { $push: { items: item._id } }, { returnDocument: 'after' }).populate("items owner")
        await shop.save()
        await shop.populate([
            { path: "owner" },
            { path: "items", options: { sort: { updatedAt: -1 } } }
        ])
        res.status(201).json({ message: "Item added successfully", shop })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const editItem = async (req, res) => {
    try {
        const { name, category, price, foodType, isBestSeller, discountPrice } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        const updatedFields = { 
            name, 
            category, 
            price: Number(price), 
            foodType, 
            isBestSeller: isBestSeller === 'true' || isBestSeller === true,
            discountPrice: Number(discountPrice) || 0,
        };
        if (image) updatedFields.image = image;
        const item = await Item.findByIdAndUpdate(req.params.itemId, updatedFields, { returnDocument: 'after' })
        if (!item) {
            return res.status(404).json({ message: "Item not found" })
        }
        const shop = await Shop.findById(item.shop).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })

        res.status(201).json({ message: "Item updated successfully", item, shop })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(400).json({ message: "Item not found" })
        }
        return res.status(200).json(item)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deleteById = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findByIdAndDelete(itemId)
        if (!item) {
            return res.status(400).json({ message: 'Item not found' })
        }
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(400).json({ message: 'Shop not found' })
        }
        shop.items = shop.items.filter((item) => item._id.toString() !== itemId)
        await shop.save()
        await shop.populate([
            { path: "owner" },
            { path: "items", options: { sort: { updatedAt: -1 } } }
        ])
        res.status(200).json({ message: 'Item deleted successfully', shop })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getItemByCity = async (req, res) => {
    try {
        const city = req.params.city
        if (!city) {
            return res.status(400).json({ message: "cant get city" })
        }
        const cleanCity = city.trim();
        const shop = await Shop.find({
            city: { $regex: new RegExp(cleanCity, "i") },
            isVerified: true
        }).populate("items")
        if (!shop || shop.length === 0) {
            return res.status(200).json({ items: [] })
        }
        const shopIds = shop.map((shop) => shop._id)
        const items = await Item.find({ shop: { $in: shopIds } }).populate("shop")
        res.status(200).json({ items })
    } catch (error) {
        console.error("Error getting items by city:", error)
        res.status(500).json({ message: "get items by city error" })
    }
}

export const rating = async(req, res) =>{
    try {
        const {itemId, rating, orderId, orderItemId} = req.body;
        if(!itemId || !rating){
            return res.status(400).json({message: "Rating and item id is required"})
        }
        if(rating > 5 || rating < 1){
            return res.status(400).json({message: "Rating must be between 1 and 5"})
        }
        const item = await Item.findById(itemId)
        if(!item){
            return res.status(400).json({message: "Item not found"})
        }

        if (orderId && orderItemId) {
            const order = await Order.findById(orderId);
            if (order) {
                let foundItem = false;
                for (let s of order.shopOrder) {
                    const shopItem = s.shopOrderItems.find(i => i._id.toString() === orderItemId);
                    if (shopItem) {
                        if (shopItem.isRated) {
                            return res.status(400).json({message: "You have already rated this item."});
                        }
                        shopItem.isRated = true;
                        foundItem = true;
                        break;
                    }
                }
                if (foundItem) {
                    await order.save();
                }
            }
        }

        const currentCount = item.rating?.count || 0;
        const currentAverage = item.rating?.average || 0;
        const newCount = currentCount + 1;
        const newAverage = ((currentAverage * currentCount) + rating) / newCount;

        item.rating = { average: newAverage, count: newCount };
        item.reviews = (item.reviews || 0) + 1;
        await item.save()
        
        res.status(200).json({message: "Rating added successfully", item})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const toggleAvailability = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        
        item.isAvailable = !item.isAvailable;
        await item.save();

        const io = req.app.get("io");
        if (io) io.emit("itemUpdate", { itemId: item._id, isAvailable: item.isAvailable, shopId: item.shop });

        res.status(200).json({ message: "Item availability toggled", item });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}