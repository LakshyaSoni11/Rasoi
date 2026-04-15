import express from "express"
import { getCurrentUser, getCityFromCoords, updateUserLocation } from "../controllers/user.controllers.js"
import { isAuth } from "../middlewares/isAuth.js"

const userRouter = express.Router()

userRouter.get('/current', isAuth, getCurrentUser)//isAuth will fetch token from cookie and from cookie userId will be extracted and passed to getCurrentUser
userRouter.get('/get-city', getCityFromCoords)
userRouter.post('/update-location', isAuth, updateUserLocation)

export default userRouter
