import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import { sendDeliveryOtpMail } from "../utils/mail.js"


export const placeOrder = async (req, res) => {
    try {
        const { paymentMethod, deliveryAddress, cartItems, totalAmount, razorpayOrderId, razorpayPaymentId } = req.body
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
            razorpayOrderId,
            razorpayPaymentId,
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
            return res.status(200).json({message: "Orders fetched successfully", orders});
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Failed to fetch orders"})
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const shopOrder = order.shopOrder.find(s => s.shop.toString() === shopId && s.owner.toString() === req.userId);
        if (!shopOrder) return res.status(403).json({ message: "Not authorized or shop order not found" });

        shopOrder.status = status;
        let deliveryBoysPayload = null;
        if(status == "out of delivery"){
            const {longitude, latitude} = order.deliveryAddress;
            const nearbyDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location:{
                    $near:{
                        $geometry:{
                            type:"Point",
                            coordinates: [Number(longitude), Number(latitude)]
                        },
                        $maxDistance: 10000
                    }
                }
            })
            const deliveryBoyIds = nearbyDeliveryBoys.map(boy => boy._id)
            const busyDeliveryBoysId = await DeliveryAssignment.find({ assignedTo: { $in: deliveryBoyIds }, status: { $nin: ["broadcasted", "delivered"] } }).distinct("assignedTo")
            const busyIdSet = new Set(busyDeliveryBoysId.map(id => String(id)))
            const availableDeliveryBoys = nearbyDeliveryBoys.filter(boy => !busyIdSet.has(String(boy._id)))
            const candidates = availableDeliveryBoys.map(boy => boy._id)
            if(candidates.length == 0){
                await order.save();
                await order.populate("shopOrder.shop", "name");
                await order.populate("user");
                await order.populate("shopOrder.shopOrderItems.item", "name image price");
                const updatedShopOrder = order.shopOrder.find(s => s.shop?._id?.toString() === shopId || s.shop?.toString() === shopId)
                return res.status(200).json({
                    message: "Order status is updated, but no delivery boys are available nearby.",
                    shopOrder: updatedShopOrder
                })
            }
            const deliveryAssignment = await DeliveryAssignment.create({
                Order: orderId,
                shop: shopId,
                shopOrderId: shopOrder._id,
                broadcastedTo: candidates,
                status: "broadcasted"
            })
            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo
            shopOrder.assignedTo = deliveryAssignment._id
            
            deliveryBoysPayload = availableDeliveryBoys.map(boy => ({
                id: boy._id,
                fullName: boy.fullName,
                mobile: boy.mobile,
                longitude: boy.location.coordinates[0],
                latitude: boy.location.coordinates[1]
            }))
        }

        await order.save();
        await order.populate("shopOrder.shop", "name");
        await order.populate("user");
        await order.populate("shopOrder.shopOrderItems.item", "name image price");
        await order.populate("shopOrder.assignedDeliveryBoy", "fullName mobile email location");
        const updatedShopOrder = order.shopOrder.find(s => s.shop?._id?.toString() === shopId || s.shop?.toString() === shopId)

        return res.status(200).json({ 
            message: "Status updated successfully",
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy || null,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder?.assignedTo,
            assignmentId: updatedShopOrder?.assignedTo?._id || updatedShopOrder?.assignedTo
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to update status" });
    }
}

export const getDeliveryBoyOrders = async (req, res) => {
    try {
        const assignments = await DeliveryAssignment.find({
            $or: [
                { broadcastedTo: req.userId, status: "broadcasted" },
                { assignedTo: req.userId, status: "assigned" }
            ]
        })
        .populate({
            path: "Order",
            populate: [
                { path: "user", select: "fullName mobile email" },
                { path: "shopOrder.shop", select: "name address city" },
                { path: "shopOrder.shopOrderItems.item", select: "name price image" }
            ]
        })
        .populate("shop", "name address city mobile")
        .sort({ createdAt: -1 });

        return res.status(200).json(assignments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch delivery boy orders" });
    }
}

export const acceptOrderAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await DeliveryAssignment.findById(assignmentId);
        
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });
        if (assignment.status !== "broadcasted") {
            return res.status(400).json({ message: "Assignment no longer available" });
        }
        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: {$nin:["broadcasted", "delivered"]}
        })
        if(alreadyAssigned){
            return res.status(400).json({ message: "You have already accepted an order" });
        }
        assignment.status = "assigned";
        assignment.assignedTo = req.userId;
        assignment.acceptedAt = Date.now();
        await assignment.save();

        const order = await Order.findById(assignment.Order);
        
        if (order) {
            const shopOrder = order.shopOrder.find(s => s._id.toString() === assignment.shopOrderId.toString());
            if (shopOrder) {
                shopOrder.assignedDeliveryBoy = req.userId;
                // Important: Also update status to show it is now with delivery boy if not already
                await order.save();
                await order.populate('shopOrder.assignedDeliveryBoy', 'fullName mobile email')
                const updatedShopOrder = order.shopOrder.find(s => s._id.toString() === assignment.shopOrderId.toString());
                return res.status(200).json({ message: "Order accepted successfully", assignment, shopOrder: updatedShopOrder });
            }
        }

        return res.status(200).json({ message: "Order accepted successfully", assignment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to accept order" });
    }
}


export const getCurrentOrder = async(req, res) =>{
    try{
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })
        .populate({
            path: "shop",
            select: "name address location mobile"
        })
        .populate("assignedTo", "fullName mobile email location")
        .populate({
            path: "Order",
            populate: [
                {
                    path: "shopOrder.shopOrderItems.item",
                    select: "name price image"
                },
                {
                    path: "shopOrder.shop",
                    select: "name address location mobile"
                },
                {
                    path: "user",
                    select: "fullName mobile email"
                }
            ]
        });

        if(!assignment || !assignment.Order){
            return res.status(200).json(null);
        }

        const shopOrder = assignment.Order.shopOrder.find(s => s._id.toString() === assignment.shopOrderId.toString());
        if(!shopOrder){
            return res.status(404).json({ message: "Shop order not found" });
        }
        let deliveryBoyLocation = {
            lat: assignment.assignedTo?.location?.coordinates?.[1] ?? null,
            lon: assignment.assignedTo?.location?.coordinates?.[0] ?? null
        };
        console.log("Delivery Boy Location: ", deliveryBoyLocation);

        let customerLocation = {
            lat: assignment.Order?.deliveryAddress?.latitude ?? null,
            lon: assignment.Order?.deliveryAddress?.longitude ?? null
        };
        console.log("Customer Location: ", customerLocation);

        let shopLocation = {
            lat: assignment.shop?.location?.coordinates?.[1] ?? null,
            lon: assignment.shop?.location?.coordinates?.[0] ?? null
        };
        console.log("--- Current Order Shop Debug ---");
        console.log("Full Shop Object from DB:", JSON.stringify(assignment.shop, null, 2));
        console.log("Shop Coordinates Extracted:", shopLocation);

        let distance = 0;
        if (deliveryBoyLocation.lat && deliveryBoyLocation.lon && customerLocation.lat && customerLocation.lon) {
            distance = Math.sqrt(
                Math.pow(deliveryBoyLocation.lon - customerLocation.lon, 2) + 
                Math.pow(deliveryBoyLocation.lat - customerLocation.lat, 2)
            );
        }
        return res.status(200).json({
            _id: assignment._id,
            user: assignment.Order.user,
            deliveryAddress: assignment.Order.deliveryAddress,
            shopOrder, 
            customerLocation,
            shopLocation,
            deliveryBoyLocation,
            distance 
        });
    }

    catch (error){
        console.log(error);
        return res.status(500).json({ message: "Failed to fetch current order" });

    }
}

export const trackOrder = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.params;
        const assignment = await DeliveryAssignment.findOne({
            Order: orderId,
            shopOrderId: shopOrderId
        })
        .populate({
            path: "shop",
            select: "name location address mobile"
        })
        .populate("assignedTo", "fullName mobile email location")
        .populate({
            path: "Order",
            populate: [
                {
                    path: "shopOrder.shop",
                    select: "name address location mobile"
                },
                {
                    path: "shopOrder.shopOrderItems.item",
                    select: "name price image"
                },
                {
                    path: "user",
                    select: "fullName mobile email"
                }
            ]
        });

        if (!assignment) return res.status(404).json({ message: "No tracking info available yet" });

        if (assignment.Order.user.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to track this order" });
        }

        const deliveryBoyLocation = {
            lat: assignment.assignedTo?.location?.coordinates?.[1] ?? null,
            lon: assignment.assignedTo?.location?.coordinates?.[0] ?? null
        };
        const customerLocation = {
            lat: assignment.Order?.deliveryAddress?.latitude ?? null,
            lon: assignment.Order?.deliveryAddress?.longitude ?? null
        };
        const shopLocation = {
            lat: assignment.shop?.location?.coordinates?.[1] ?? null,
            lon: assignment.shop?.location?.coordinates?.[0] ?? null
        };

        const distance = (deliveryBoyLocation.lat && customerLocation.lat) ? 
            Math.sqrt(Math.pow(deliveryBoyLocation.lon - customerLocation.lon, 2) + Math.pow(deliveryBoyLocation.lat - customerLocation.lat, 2)) : 0;

        return res.status(200).json({
            status: assignment.status,
            deliveryBoy: assignment.assignedTo,
            shop: assignment.shop,
            deliveryBoyLocation,
            customerLocation,
            shopLocation,
            distance,
            orderData: assignment.Order
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching tracking details" });
    }
}

export const completeOrderDelivery = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await DeliveryAssignment.findById(assignmentId);

        if (!assignment) return res.status(404).json({ message: "Assignment not found" });
        if (assignment.assignedTo.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to complete this delivery" });
        }

        assignment.status = "delivered";
        await assignment.save();

        const order = await Order.findById(assignment.Order);
        if (order) {
            const shopOrder = order.shopOrder.find(s => s._id.toString() === assignment.shopOrderId.toString());
            if (shopOrder) {
                shopOrder.status = "delivered";
                await order.save();
            }
        }

        return res.status(200).json({ message: "Delivery completed successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to complete delivery" });
    }
}

export const sendDeliveryOtp = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await DeliveryAssignment.findById(assignmentId)
            .populate({
                path: "Order",
                populate: { path: "user", select: "email fullName" }
            });

        if (!assignment) return res.status(404).json({ message: "Assignment not found" });
        if (assignment.assignedTo.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        assignment.otp = otp;
        assignment.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await assignment.save();

        const userEmail = assignment.Order.user.email;
        const orderId = assignment.Order._id.toString();
        
        await sendDeliveryOtpMail(userEmail, otp, orderId);

        return res.status(200).json({ message: "OTP sent to customer's email" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to send OTP" });
    }
};

export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { otp } = req.body;

        const assignment = await DeliveryAssignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });
        if (assignment.assignedTo.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (assignment.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > assignment.otpExpires) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // OTP Valid - Mark as delivered
        assignment.status = "delivered";
        assignment.otp = null;
        assignment.otpExpires = null;
        await assignment.save();

        const order = await Order.findById(assignment.Order);
        if (order) {
            const shopOrder = order.shopOrder.find(s => s._id.toString() === assignment.shopOrderId.toString());
            if (shopOrder) {
                shopOrder.status = "delivered";
                await order.save();
            }
        }

        return res.status(200).json({ message: "Order delivered successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to verify OTP" });
    }
};

