import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
    try {
        const { name, category, price, foodType } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        let shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" })
        }
        const item = await Item.create({ name, category, price, foodType, image, shop: shop._id })

        shop = await Shop.findByIdAndUpdate(shop._id, { $push: { items: item._id } }, { new: true }).populate("items owner")
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
        const { name, category, price, foodType } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        const item = await Item.findByIdAndUpdate(req.params.itemId, { name, category, price, foodType, image }, { new: true })
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
        const shop = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items")
        if (!shop) {
            return res.status(400).json({ message: "No shops found in this city" })
        }
        const shopIds = shop.map((shop) => shop._id)
        const items = await Item.find({ shop: { $in: shopIds } })
        res.status(200).json({ items })
    } catch (error) {
        console.error("Error getting items by city:", error)
        res.status(500).json({ message: "get items by city error" })
    }
}