
import { JsonRpcProvider } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const avalancheProvider = new JsonRpcProvider(process.env.AVALANCHE_C_CHAIN_TESTNET_RPC_URL);

export default avalancheProvider;