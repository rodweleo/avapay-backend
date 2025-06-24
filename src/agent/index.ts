import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { GOOGLE_GENAI_MODEL } from "../utils/google-genai";
import { Tool } from "@langchain/core/tools";
import { AvalancheWalletBalanceTool } from "./tools/queries/getWalletBalanceTool";
import { BLOCKCHAIN_FOCUSED_SYSTEM_MESSAGE } from "./prompts";
import { AvalancheSendAvaxBalanceTool } from "./tools/transactions/sendAvaxTool";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";


const initializeAgent = async () => {
    const tools: Tool[] = [new AvalancheWalletBalanceTool(), new AvalancheSendAvaxBalanceTool({}), new TavilySearchResults({ maxResults: 3 })]
    const agentCheckpointer = new MemorySaver();

    GOOGLE_GENAI_MODEL.bindTools(tools)
    GOOGLE_GENAI_MODEL.useSystemInstruction

    const googleGenAiAgentModel = createReactAgent({
        llm: GOOGLE_GENAI_MODEL,
        tools: tools,
        checkpointSaver: agentCheckpointer,
        prompt: BLOCKCHAIN_FOCUSED_SYSTEM_MESSAGE
    });


    return { googleGenAiAgentModel };
};

export default initializeAgent;
