
import express from "express"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import WalletRouter from "./routes/wallet";
import TransactionsRouter from "./routes/transactions";
import AgentRouter from "./routes/agent";
import { logger } from "./utils/logger";
import { limiter } from "./utils/limiter";
import { authMiddleware } from "./middlewares/authMiddleware"
import cors from "cors"
import UserRouter from "./routes/users";
import AuthRouter from "./routes/auth";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:8080", "https://uat-avapay.vercel.app"]
}))
app.use(limiter)
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} ${req.ip} ${req.headers["user-agent"]}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:8080", "https://uat-avapay.vercel.app"],
        methods: ["GET", "POST", "OPTIONS"],
    },
});

export { io };

io.on('connection', (socket) => {
    logger.info('A user connected', socket.id);

    socket.on('register', (userIdOrPhone) => {
        socket.data.userIdentifier = userIdOrPhone;
        logger.info(`User registered: ${userIdOrPhone} on socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
        io.emit("user-disconnected", socket.id);
    });
});


app.use("/auth", AuthRouter);
app.use("/wallet", authMiddleware, WalletRouter);
app.use("/transactions", authMiddleware, TransactionsRouter);
app.use("/agent", authMiddleware, AgentRouter);


server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`,);
})