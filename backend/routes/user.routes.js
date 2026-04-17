import express from "express"
import { getCurrentUser, getCityFromCoords, updateUserLocation } from "../controllers/user.controllers.js"
import { isAuth } from "../middlewares/isAuth.js"
import { validate } from "../middlewares/validate.js"
import { UpdateLocationSchema } from "../utils/schemas.js"

const userRouter = express.Router()

userRouter.get('/current', isAuth, getCurrentUser)
userRouter.get('/get-city', getCityFromCoords)
userRouter.post('/update-location', isAuth, validate(UpdateLocationSchema), updateUserLocation)

export default userRouter
