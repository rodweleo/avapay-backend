import { ethers } from "ethers";
import avalancheProvider from "../../../utils/avalanche/provider";

/**
 * Fetch and summarize transactions for an Avalanche C-Chain (EVM) wallet
 * @param {string} address - The wallet address (0x... format)
 * @param {number} [maxTransactions=10] - Max transactions to fetch
 * @returns {Promise<Object[]>} - Array of summarized transactions
 */
async function getTransactionSummary(address, maxTransactions = 10) {

    // Fetch transaction history using Snowtrace API (or another explorer API)
    // Replace 'YOUR_SNOWTRACE_API_KEY' with your actual API key
    const snowtraceApiKey = process.env.SNOWTRACE_API_KEY!;
    const url = `https://api.snowtrace.io/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${snowtraceApiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== "1") {
        throw new Error("Failed to fetch transaction history");
    }
    const history = data.result;
    const recentTxs = history.slice(0, maxTransactions);

    // Summarize each transaction
    const summarizedTxs = await Promise.all(
        recentTxs.map(async (tx) => {
            // Get transaction receipt (for status & gas used)
            const receipt = await avalancheProvider.getTransactionReceipt(tx.hash);

            // Parse value from Wei to AVAX
            const valueAvax = ethers.formatEther(tx.value);

            return {
                hash: tx.hash,
                blockNumber: tx.blockNumber,
                timestamp: (await avalancheProvider.getBlock(tx.blockNumber))?.timestamp,
                from: tx.from,
                to: tx.to,
                value: valueAvax + " AVAX",
                status: receipt?.status === 1 ? "✅ Success" : "❌ Failed",
                gasUsed: receipt?.gasUsed.toString(),
                gasPrice: ethers.formatUnits(tx.gasPrice, "gwei") + " gwei",
            };
        })
    );

    return summarizedTxs;
}