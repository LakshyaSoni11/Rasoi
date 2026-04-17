import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import { createEditShop, getShop, getShopsByCity, getShopById } from "../controllers/shop.controller.js"
import upload from "../middlewares/multer.js"
import { validate } from "../middlewares/validate.js"
import { ShopSchema } from "../utils/schemas.js"

const shopRouter = express.Router()

shopRouter.post('/create-edit', isAuth, upload.single("image"), validate(ShopSchema), createEditShop)
shopRouter.get('/get-shop', isAuth, getShop)
shopRouter.get('/get-by-city/:city', getShopsByCity)
shopRouter.get('/get-by-id/:shopId', getShopById)

export default shopRouter
