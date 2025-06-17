
import axios from "axios";

export async function getAVAXtoKESRate(): Promise<number> {
    try {
        const response = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=kes"
        );
        return response.data["avalanche-2"].kes;
    } catch (err) {
        console.error("Failed to fetch AVAX/KES rate from CoinGecko:", err);
        throw new Error("Could not fetch AVAX exchange rate");
    }
}