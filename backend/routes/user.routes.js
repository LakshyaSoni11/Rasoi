import express from "express"
import { getCurrentUser, getCityFromCoords } from "../controllers/user.controllers.js"
import { isAuth } from "../middlewares/isAuth.js"

const userRouter = express.Router()

userRouter.get('/current', isAuth, getCurrentUser)//isAuth will fetch token from cookie and from cookie userId will be extracted and passed to getCurrentUser
userRouter.get('/get-city', getCityFromCoords)

export default userRouter
