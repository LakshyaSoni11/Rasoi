import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"


export const placeOrder = async (req, res) => {
    try {
        const { paymentMethod, deliveryAddress, cartItems, totalAmount } = req.body
        if (cartItems.length == 0 || !cartItems) {
            return res.status(400).json({ message: "Cart is empty" })
        }
        if (!deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: "send complete delivery address" })
        }
        const groupItemsByShop = {}
        for (const item of cartItems) {
            // Item.shop is passed as the MongoDB ID string from Redux
            const shopId = item.shop;
            if (!shopId) {
                return res.status(400).json({ message: "Item is missing a shop reference" });
            }
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = []
            }
            groupItemsByShop[shopId].push(item)
        }
        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async shopId => {
            const shop = await Shop.findById(shopId).populate("owner")
            if (!shop) {
                return res.status(404).json({ message: "Shop not found" })
            }
            const items = groupItemsByShop[shopId]
            const subTotal = items.reduce((total, i) => total + i.price * i.quantity, 0)
            return {
                shop: shopId,
                owner: shop.owner._id,
                subTotal,
                totalAmount: subTotal,
                shopOrderItems: items.map(item => {
                    return {
                        item: item.id,
                        price: item.price,
                        quantity: item.quantity,
                        name: item.name
                    }
                })
            }
        }))
        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrder: shopOrders
        })
        return res.status(201).json({ message: "Order placed successfully", order: newOrder })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "place order failed" })
    }
}

export const getMyOrders = async (req, res) =>{
    try {
        const user = await User.findById(req.userId)
        if(user.role == "user"){
            const orders = await Order.find({user: req.userId})
            .sort({createdAt: -1})
            .populate("shopOrder.shop", "name")
            .populate("shopOrder.owner", "name email mobile")
            .populate("shopOrder.shopOrderItems.item", "name image price")
        // .select("-deliveryAddress")
        return res.status(200).json({message: "Orders fetched successfully", orders})
        }
        else if(user.role == "owner"){
            const orders = await Order.find({"shopOrder.owner": req.userId})
            .sort({createdAt: -1})
            .populate("shopOrder.shop", "name")
            .populate("user")
            .populate("shopOrder.shopOrderItems.item", "name image price")
            // .select("-deliveryAddress")
            return res.status(200).json({message: "Orders fetched successfully", orders})
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Failed to fetch orders"})
    }
}
