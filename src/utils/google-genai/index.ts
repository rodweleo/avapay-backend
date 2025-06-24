
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { TaskType } from "@google/gen-ai";

export const GOOGLE_GENAI_MODEL = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    maxOutputTokens: 2048,
    temperature: 0,
});

// export const GOOGLE_GENAI_EMBEDDINGS = new GoogleGenerativeAIEmbeddings({
//     model: "text-embedding-004", // 768 dimensions
//     taskType: TaskType.RETRIEVAL_DOCUMENT,
//     title: "Document title",
// })