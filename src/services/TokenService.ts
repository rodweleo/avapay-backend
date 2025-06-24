
import { ethers, TransactionResponse, Wallet } from "ethers";
import avalancheProvider from "../utils/avalanche/provider";
import dotenv from "dotenv"
dotenv.config()

export interface SendAvaxProps {
    to: `0x${string}`;
    amount: bigint
}

class TokenService {

    private systemWallet: Wallet | null = null;

    constructor() { }

    public async sendAvax({
        to,
        amount
    }: SendAvaxProps): Promise<TransactionResponse | null> {
        this.systemWallet = new ethers.Wallet(process.env.APP_WALLET_PRIVATE_KEY!, avalancheProvider);

        try {
            // Send transaction from system wallet
            const tx = await this.systemWallet.sendTransaction({
                to: to,
                value: amount,
            });
            return tx
        } catch (e) {
            console.log(e)
            return null
        }
    }
}

export default TokenService;