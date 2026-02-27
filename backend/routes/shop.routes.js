import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import { createEditShop, getShop, getShopsByCity } from "../controllers/shop.controller.js"
import upload from "../middlewares/multer.js"

const shopRouter = express.Router()

shopRouter.post('/create-edit', isAuth, upload.single("image"), createEditShop)
shopRouter.get('/get-shop', isAuth, getShop)
shopRouter.get('/get-by-city/:city', getShopsByCity)

export default shopRouter
