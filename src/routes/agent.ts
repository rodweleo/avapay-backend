
import express, { Response, Request } from "express"
import initializeAgent from "../agent"
import { HumanMessage } from "@langchain/core/messages"
import { logger } from "../utils/logger"
import { v4 as uuidv4 } from "uuid"

const AgentRouter = express.Router()

AgentRouter.post("/chat", async (req: Request, res: Response): Promise<any> => {

    if (!req.body) {
        return res.status(400).json({
            message: "Request body is required: userInput: string"
        })
    }
    const { userInput } = req.body

    const sessionId = uuidv4()
    try {
        const { googleGenAiAgentModel } = await initializeAgent();

        const result = await googleGenAiAgentModel.invoke({
            messages: [new HumanMessage(userInput)],
        }, {
            configurable: {
                thread_id: sessionId
            }
        });

        const response = result.messages[result.messages.length - 1].content

        res.status(200).json({
            response
        })
    } catch (e) {
        logger.error(`Something went wrong: ${JSON.stringify(e)}`)
        res.status(500).json({
            message: `Something went wrong: ${JSON.stringify(e)}`
        })
    }
})

export default AgentRouter