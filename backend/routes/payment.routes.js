import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { createRazorpayOrder, verifyPayment } from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", isAuth, createRazorpayOrder);
paymentRouter.post("/verify-payment", isAuth, verifyPayment);

export default paymentRouter;
