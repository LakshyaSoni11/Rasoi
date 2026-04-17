import User from "../models/user.model.js"
import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import axios from "axios";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(400).json({ message: "Unauthorized" })
        }
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: "Get Current User error" })
    }
}

export const getCityFromCoords = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and Longitude are required" })
        }

        // Proxy request to Nominatim with custom User-Agent to avoid 403
        const result = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
            headers: {
                'User-Agent': 'FoodDeliveryApp/1.0 (dev@food-delivery-app.com)',
                'Referer': 'http://localhost:5173'
            }
        });

        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Geolocation Error:", error.message);
        return res.status(500).json({ message: "Failed to fetch location" })
    }
}

export const updateUserLocation = async(req, res) => {
    try {
        const { lat, lon } = req.body;
        
        if (lat === undefined || lon === undefined) {
            return res.status(400).json({ message: "Latitude and Longitude are required" });
        }

        const user = await User.findByIdAndUpdate(
            req.userId, 
            {
                $set: {
                    "location.type": "Point",
                    "location.coordinates": [parseFloat(lon), parseFloat(lat)]
                }
            },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // SOCKET: If this is a delivery boy, notify any customers tracking them
        if (user.role === "deliveryBoy") {
            const io = req.app.get("io");
            if (io) {
                // Find active assignments for this delivery boy
                const activeAssignments = await DeliveryAssignment.find({
                    assignedTo: user._id,
                    status: "assigned"
                });

                for (const assignment of activeAssignments) {
                    // Populate order here to get user ID
                    const populated = await assignment.populate("Order");
                    if (populated.Order?.user) {
                        const targetRoom = `user_${populated.Order.user.toString()}`;
                        io.to(targetRoom).emit("locationUpdate", {
                            lat: parseFloat(lat),
                            lon: parseFloat(lon),
                            assignmentId: assignment._id
                        });
                    }
                }
            }
        }

        return res.status(200).json({ message: "Location updated successfully" });
    } catch (error) {
        console.error("Update Location Error:", error);
        return res.status(500).json({ message: "Failed to update location" });
    }
}