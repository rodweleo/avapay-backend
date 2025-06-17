
import { ethers } from "ethers";
import { Router, Request, Response } from "express";
import avalancheProvider from "../utils/avalanche/provider";
import { getAVAXtoKESRate } from "../utils/avalanche/getExchangeRate";

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
        const avaxAmount = parseFloat((amountKES / rateKESPerAVAX).toFixed(6));
        const amountInWei = ethers.parseEther(avaxAmount.toString());

        // Send transaction from system wallet
        const tx = await systemWallet.sendTransaction({
            to: walletAddress,
            value: amountInWei,
        });

        console.log(`Sent ${avaxAmount} AVAX to ${walletAddress} for ${phone}`);
        res.json({
            success: true,
            message: `Sent ${avaxAmount} AVAX to ${walletAddress} for ${phone}`,
            txHash: tx.hash,
            avaxAmount,
            explorer: `https://testnet.snowtrace.io/tx/${tx.hash}`,
        });
    } catch (e: any) {
        console.error("Error buying AVAX using M-Pesa", e.message);
        res.status(500).json({ error: "Failed to send AVAX", details: e.message });
    }
})

export default TransactionsRouter;