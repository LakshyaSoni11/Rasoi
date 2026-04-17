import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import adminRouter from "./routes/admin.routes.js";
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";
import helmet from "helmet";


dotenv.config();



const app = express();
app.use(helmet({
    contentSecurityPolicy: false,   // CSP is not needed for a pure API backend and blocks Socket.io
    crossOriginEmbedderPolicy: false // Prevents issues with cross-origin requests from the SPA
}));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }
})
app.set("io", io)
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/shop", shopRouter)
app.use("/api/item", itemRouter)
app.use("/api/order", orderRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/admin", adminRouter)
socketHandler(io)
const port = process.env.PORT || 5000;

server.listen(port, () => {
    connectDb();
    console.log(`App running in port ${port}`)
})