import { Tool } from "@langchain/core/tools";
import { getWalletBalance } from "../../../functions/wallet/getWalletBalance";

export class AvalancheWalletBalanceTool extends Tool {
    name = 'avalanche_wallet_balance'
    description = `Get the balance of an avalanche wallet
        Inputs (input is a JSON string)
        wallet_address: string - This is the wallet address on avalanche
    `
    protected async _call(input: string): Promise<string> {
        try {
            const parsedInput = JSON.parse(input);
            const { wallet_address } = parsedInput;

            const balance = await getWalletBalance(wallet_address)

            return JSON.stringify({
                status: "success",
                data: balance
            });
        } catch (e: any) {
            return JSON.stringify({
                status: "error",
                message: e.message,
                code: e.code || "UNKNOWN_ERROR",
            });
        }
    }
}