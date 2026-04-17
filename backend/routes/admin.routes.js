import express from "express";
import { isAuth, isAdmin } from "../middlewares/isAuth.js";
import { 
    getMetrics, 
    getVerifications, 
    verifyShop, 
    verifyDeliveryBoy, 
    verifyAllExisting, 
    seedAdmin, 
    getAllOrders 
} from "../controllers/admin.controllers.js";

const adminRouter = express.Router();

adminRouter.get("/metrics", isAuth, isAdmin, getMetrics);
adminRouter.get("/verifications", isAuth, isAdmin, getVerifications);
adminRouter.put("/verify-shop/:id", isAuth, isAdmin, verifyShop);
adminRouter.put("/verify-rider/:id", isAuth, isAdmin, verifyDeliveryBoy);
adminRouter.post("/verify-all", isAuth, isAdmin, verifyAllExisting);
adminRouter.get("/orders", isAuth, isAdmin, getAllOrders);

// Endpoint to quickly grant the testing user admin rights
adminRouter.post("/make-me-admin", isAuth, seedAdmin);

export default adminRouter;
