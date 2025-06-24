import { Tool } from "@langchain/core/tools";
import avalancheProvider from "../../../utils/avalanche/provider";
import { ethers } from "ethers";

export class AvalancheSendAvaxBalanceTool extends Tool {
    name = 'avalanche_send_avax'
    description = `Prepares an AVAX transaction for sending avax from one avax wallet to another in the triggering metamask or Core Wallet
        Inputs (input is a JSON string)
        from: string - This is the sender's wallet address on avalanche
        to: string - This is the receiver's wallet address on avalanche
        amount: number - The amount of AVAX to send in ETH units

        PS: RETURN ONLY THE JSON format easy for parsing in the frontend as indicated below. NO OTHER EXPLANATIONS
    `
    protected async _call(input: string): Promise<{}> {
        try {
            const parsedInput = JSON.parse(input);
            const { from, to, amount } = parsedInput;

            const nonce = await avalancheProvider.getTransactionCount(from, "latest");

            const tx = {
                to,
                from,
                value: ethers.parseEther(amount.toString()), // convert AVAX to wei
                gasLimit: 21000,
                nonce,
                chainId: 43113, // Testnet Avalanche C-Chain
                type: 2, // EIP-1559
                maxPriorityFeePerGas: ethers.parseUnits("2.5", "gwei"),
                maxFeePerGas: ethers.parseUnits("100", "gwei"),
            };

            return {
                status: "success",
                step: "prepared_transaction",
                data: {
                    ...tx,
                    value: tx.value.toString(),
                    gasLimit: tx.gasLimit.toString(),
                    maxPriorityFeePerGas: tx.maxPriorityFeePerGas.toString(),
                    maxFeePerGas: tx.maxFeePerGas.toString()
                }
            };
        } catch (e: any) {
            return {
                status: "error",
                message: e.message,
                code: e.code || "UNKNOWN_ERROR",
            };
        }
    }
}