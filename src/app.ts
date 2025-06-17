
import express from "express"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import WalletRouter from "./routes/wallet";
import TransactionsRouter from "./routes/transactions";
import { logger } from "./utils/logger";


dotenv.config();

const { PORT } = process.env;

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}, ${req.body}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next()
})
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (msg) => {
        console.log(`Message received: ${msg}`);
        socket.emit('reply', 'Hello from server!');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


app.use("/wallet", WalletRouter);
app.use("/transactions", TransactionsRouter);

server.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});