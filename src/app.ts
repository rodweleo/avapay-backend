
import express from "express"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import WalletRouter from "./routes/wallet";
import TransactionsRouter from "./routes/transactions";
import { logger } from "./utils/logger";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:8080", "https://avapay.vercel.ap"],
        methods: ["GET", "POST", "OPTIONS"],
    },
});

export { io };

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('register', (userIdOrPhone) => {
        socket.data.userIdentifier = userIdOrPhone;
        console.log(`User registered: ${userIdOrPhone} on socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
        io.emit("user-disconnected", socket.id);
    });
});


app.use("/wallet", WalletRouter);
app.use("/transactions", TransactionsRouter);

server.listen(PORT, () => {
    console.log('Server is running on port', PORT);
})