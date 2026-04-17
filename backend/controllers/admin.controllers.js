import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";

export const getMetrics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalOwners = await User.countDocuments({ role: "owner" });
        const totalDeliveryBoys = await User.countDocuments({ role: "deliveryBoy" });
        const totalShops = await Shop.countDocuments();
        
        // Orders & Revenue
        const orders = await Order.find().populate("shopOrder");
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Calculate Revenue over the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentOrders = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$totalAmount" },
                    dailyOrders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json({
            stats: { totalUsers, totalOwners, totalDeliveryBoys, totalShops, totalOrders, totalRevenue },
            chartData: recentOrders
        });
    } catch (error) {
        console.error("Metrics error:", error);
        return res.status(500).json({ message: "Failed to fetch metrics" });
    }
};

export const getVerifications = async (req, res) => {
    try {
        const unverifiedShops = await Shop.find({ isVerified: false }).populate("owner", "fullName email mobile");
        const unverifiedBoys = await User.find({ role: "deliveryBoy", isVerified: false });
        
        return res.status(200).json({ unverifiedShops, unverifiedBoys });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch verifications" });
    }
};

export const verifyShop = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
        return res.status(200).json({ message: "Shop verified successfully", shop });
    } catch (error) {
        return res.status(500).json({ message: "Failed to verify shop" });
    }
};

export const verifyDeliveryBoy = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
        return res.status(200).json({ message: "Delivery boy verified successfully", user });
    } catch (error) {
        return res.status(500).json({ message: "Failed to verify delivery boy" });
    }
};

export const verifyAllExisting = async (req, res) => {
    try {
        // Fallback endpoint to quickly un-gate legacy users without isVerified flags
        await Shop.updateMany({}, { isVerified: true });
        await User.updateMany({ role: "deliveryBoy" }, { isVerified: true });
        return res.status(200).json({ message: "All existing shops and delivery partners have been verified." });
    } catch (error) {
        return res.status(500).json({ message: "Failed to verify all." });
    }
};

export const seedAdmin = async (req, res) => {
    try {
        // Upgrades the caller to admin so user can test the admin features
        const user = await User.findByIdAndUpdate(req.userId, { role: "admin" }, { new: true });
        return res.status(200).json({ message: "You are now an admin!", user });
    } catch (error) {
        return res.status(500).json({ message: "Failed to set admin." });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(50) // Just the latest 50 for quick global feed
            .populate("user", "fullName email")
            .populate("shopOrder.shop", "name");
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch orders" });
    }
};
