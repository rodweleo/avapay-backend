
import { ethers } from "ethers";
import { Router, Request, Response } from "express";
import avalancheProvider from "../utils/avalanche/provider";
import { getAVAXtoKESRate } from "../utils/avalanche/getExchangeRate";
import MpesaService from "../services/MpesaService";
import { logger } from "../utils/logger";
import { io } from "../app";
import axios from "axios"
import dotenv from "dotenv";
dotenv.config()

//we need a mock database
const users = [
    {
        phoneNumber: "254795565344",
        walletAddress: "0x6b543eF28F6D5E9f2da0e3dB73717722B2eAd32c"
    }
]

const TransactionsRouter = Router();

const systemWallet = new ethers.Wallet(process.env.APP_WALLET_PRIVATE_KEY!, avalancheProvider);

TransactionsRouter.post("/buy-avax", async (req: Request, res: Response): Promise<any> => {

    const { phone, amountKES, walletAddress } = req.body;

    if (!phone || !amountKES || !walletAddress) {
        return res.status(400).json({ error: "Missing phone, amountKES, or walletAddress" });
    }

    if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ error: "Invalid wallet address" });
    }

    try {
        // Calculate AVAX equivalent
        const rateKESPerAVAX = await getAVAXtoKESRate();

        //calculate the platform fee
        const platformFeePercentage = 0.04
        const platformFee = amountKES * platformFeePercentage
        const netAmountKES = Math.floor(amountKES - platformFee)

        const avaxAmount = parseFloat((netAmountKES / rateKESPerAVAX).toFixed(6));

        // if (avaxAmount === 0) {
        //     return res.status(400).json({ error: "Amount is too low to buy AVAX" });
        // }

        //prompt user through mpesa
        const mpesaService = MpesaService.getInstance();

        const response = await mpesaService.stkPush(amountKES, phone)

        logger.info(`M-Pesa STK push initiated for ${phone} to buy ${avaxAmount} AVAX`);

        res.json({
            success: true,
            ...response
        })
    } catch (e: any) {
        console.error("Error buying AVAX using M-Pesa", e.message);
        res.status(500).json({ error: "Failed to send AVAX", details: e.message });
    }
})

TransactionsRouter.post("/mpesa/payment/stkCallbackURL", async (req, res) => {
    try {
        const { Body } = req.body;
        const { stkCallback } = Body;
        const { ResultCode, CallbackMetadata } = stkCallback;

        let mpesaReceipt = null;
        let amount = null;
        let phoneNumber = null;

        if (CallbackMetadata && CallbackMetadata.Item) {
            for (let item of CallbackMetadata.Item) {
                if (item.Name === 'MpesaReceiptNumber') mpesaReceipt = item.Value;
                if (item.Name === 'Amount') amount = item.Value;
                if (item.Name === 'PhoneNumber') phoneNumber = item.Value;
            }
        }

        logger.info("Processing STK callback...");
        logger.info(`STK Callback ResultCode: ${ResultCode}, MpesaReceipt: ${mpesaReceipt}, Amount: ${amount}, PhoneNumber: ${phoneNumber}`);

        // Find the socket of the specific user
        for (const [id, socket] of io.sockets.sockets) {
            if (socket.data.userIdentifier === phoneNumber) {
                logger.info(`Found socket for user ${phoneNumber} with ID ${id}`);
                logger.info(`Sending avax to user ${phoneNumber} or socket id ${socket.id}...`);

                await axios.post(`${process.env.PRODUCTION_BACKEND_URL!}/transactions/sendAvax`, {
                    phoneNumber,
                    amount,
                    socketId: socket.id
                })
                logger.info(`AVAX sent to user ${phoneNumber} or socket id ${socket.id}`);
            }
        }

        res.status(200).json({
            message: "STK Callback processed successfully",
            resultCode: 0,
            mpesaReceipt,
            amount,
            phoneNumber,
        });
    } catch (e: any) {
        console.error("STK Callback Error:", e.message);
        res.status(500).json({ message: "Error processing callback" });
    }
})

TransactionsRouter.post("/sendAvax", async (req: Request, res: Response): Promise<any> => {
    const { phoneNumber, amount } = req.body;

    if (!phoneNumber || !amount) {
        return res.status(400).json({ error: "Missing phoneNumber or amount" });
    }

    //find the user by the phone number
    const user = users.find(user => user.phoneNumber === phoneNumber);
    if (!user) {
        return res.status(404).json({ error: `User with phone number ${phoneNumber} not found` });
    }

    const { walletAddress } = user

    if (!walletAddress) {
        return res.status(400).json({ error: "Missing walletAddress" });
    }

    if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ error: "Invalid wallet address" });
    }

    try {
        // Calculate AVAX equivalent
        const rateKESPerAVAX = await getAVAXtoKESRate();

        //calculate the platform fee
        const platformFeePercentage = 0.04
        const platformFee = amount * platformFeePercentage
        const netAmountKES = Math.floor(amount - platformFee)

        const avaxAmount = parseFloat((netAmountKES / rateKESPerAVAX).toFixed(6));
        const amountInWei = ethers.parseEther(avaxAmount.toString());

        // Send transaction from system wallet
        const tx = await systemWallet.sendTransaction({
            to: walletAddress,
            value: amountInWei,
        });
        await tx.wait();

        logger.info(`Sent ${avaxAmount} AVAX to ${walletAddress}`);

        if (req.body.socketId) {
            const socket = io.sockets.sockets.get(req.body.socketId);
            if (socket) {
                socket.emit("payment-success", {
                    message: `Sent ${avaxAmount} AVAX to ${walletAddress} for ${phoneNumber}`,
                    txHash: tx.hash,
                    avaxAmount,
                    netAmountKES,
                    rateKESPerAVAX,
                    feePercent: platformFeePercentage * 100,
                    feeAmountKES: platformFee,
                    walletAddress,
                    phoneNumber,
                    explorer: `https://testnet.snowtrace.io/tx/${tx.hash}`,
                });
            } else {
                logger.warn(`Socket with ID ${req.body.socketId} not found`);
            }
        }

        const successPayload = {
            success: true,
            message: `Sent ${avaxAmount} AVAX to ${walletAddress} for ${phoneNumber}`,
            txHash: tx.hash,
            avaxAmount,
            netAmountKES,
            rateKESPerAVAX,
            feePercent: platformFeePercentage * 100,
            feeAmountKES: platformFee,
            walletAddress,
            phoneNumber,
            explorer: `https://testnet.snowtrace.io/tx/${tx.hash}`,
        }
        res.json(successPayload);
    } catch (e: any) {
        console.error("Error sending AVAX", e.message);
        res.status(500).json({ error: "Failed to send AVAX", details: e.message });
    }
})

export default TransactionsRouter;