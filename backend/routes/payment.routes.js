import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { createRazorpayOrder, verifyPayment } from "../controllers/payment.controller.js";
import { validate } from "../middlewares/validate.js";
import { CreatePaymentOrderSchema, VerifyPaymentSchema } from "../utils/schemas.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", isAuth, validate(CreatePaymentOrderSchema), createRazorpayOrder);
paymentRouter.post("/verify-payment", isAuth, validate(VerifyPaymentSchema), verifyPayment);

export default paymentRouter;
