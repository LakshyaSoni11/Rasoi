import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import {  getMyOrders, placeOrder, updateOrderStatus, acceptOrderAssignment, completeOrderDelivery, getDeliveryBoyOrders, getCurrentOrder, trackOrder, sendDeliveryOtp, verifyDeliveryOtp } from "../controllers/order.controllers.js"
import { validate } from "../middlewares/validate.js"
import { OrderSchema } from "../utils/schemas.js"

const orderRouter = express.Router()

orderRouter.post('/place-order', isAuth, validate(OrderSchema), placeOrder)
orderRouter.get('/my-orders', isAuth, getMyOrders)
orderRouter.post('/update-status/:orderId/:shopId', isAuth, updateOrderStatus)
orderRouter.get('/get-current-order', isAuth, getCurrentOrder)
orderRouter.get('/track/:orderId/:shopOrderId', isAuth, trackOrder)
orderRouter.get('/delivery-boy-orders', isAuth, getDeliveryBoyOrders)
orderRouter.post('/accept-order/:assignmentId', isAuth, acceptOrderAssignment)
orderRouter.post('/complete-delivery/:assignmentId', isAuth, completeOrderDelivery)
orderRouter.post('/send-otp/:assignmentId', isAuth, sendDeliveryOtp)
orderRouter.post('/verify-otp/:assignmentId', isAuth, verifyDeliveryOtp)

export default orderRouter
