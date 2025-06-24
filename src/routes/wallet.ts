import { Request, Response, Router } from "express";
import { isAddress, formatEther } from "ethers";
import avalancheProvider from "../utils/avalanche/provider";
import { getWalletBalance } from "../functions/wallet/getWalletBalance";


const WalletRouter = Router();

WalletRouter.get("/balance", async (req: Request, res: Response): Promise<any> => {
    const { address } = req.query;

    if (!isAddress(address)) {
        return res.status(400).json({ error: "Invalid wallet address." });
    }

    try {
        const balance = await getWalletBalance(address as `0x${string}`)

        res.json(balance);
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch balance", detail: err.message });
    }
});

export default WalletRouter