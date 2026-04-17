import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"
import { addItem, deleteById, editItem, getItemByCity, getItemById, rating, toggleAvailability } from "../controllers/item.controller.js"
import { validate } from "../middlewares/validate.js"
import { ItemSchema } from "../utils/schemas.js"

const itemRouter = express.Router()

itemRouter.post('/add-item', isAuth, upload.single("image"), validate(ItemSchema), addItem)
itemRouter.post('/edit-item/:itemId', isAuth, upload.single("image"), validate(ItemSchema), editItem)
itemRouter.get('/get-by-id/:itemId', getItemById);
itemRouter.delete('/delete-item/:itemId', isAuth, deleteById)
itemRouter.get('/get-by-city/:city', isAuth, getItemByCity)
itemRouter.post("/rating", isAuth, rating)
itemRouter.put("/toggle-availability/:itemId", isAuth, toggleAvailability)
export default itemRouter
