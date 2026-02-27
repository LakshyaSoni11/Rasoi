import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"
import { addItem, deleteById, editItem, getItemByCity, getItemById } from "../controllers/item.controller.js"

const itemRouter = express.Router()

itemRouter.post('/add-item', isAuth, upload.single("image"), addItem)//isAuth will fetch token from cookie and from cookie userId will be extracted and passed to getCurrentUser
itemRouter.post('/edit-item/:itemId', isAuth, upload.single("image"), editItem)
itemRouter.get('/get-by-id/:itemId', getItemById);
itemRouter.delete('/delete-item/:itemId', isAuth, deleteById)
itemRouter.get('/get-by-city/:city', isAuth, getItemByCity)
export default itemRouter
