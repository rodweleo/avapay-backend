import { formatEther } from "ethers";
import avalancheProvider from "../../utils/avalanche/provider";

export const getWalletBalance = async (address: `0x${string}`) => {
    const balance = await avalancheProvider.getBalance(address);
    const formatted = formatEther(balance);

    return {
        address,
        balance: formatted,
        unit: "AVAX"
    }
}