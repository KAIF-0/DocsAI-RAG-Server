import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "../../configs/gemini.js";

export const generateNode = async (state) => {
  const { question, context, url, key } = state;

  const systemPrompt = `You are a technical documentation assistant for ${key}.
Documentation URL: ${url}

INSTRUCTIONS:
1. PRIORITIZE the provided DOCUMENTATION CONTEXT.
2. If the context contains the answer, use it strictly.
3. If the context is missing or insufficient, use your GENERAL TECHNICAL KNOWLEDGE.
4. If using general knowledge, mention that the specific docs didn't cover it but this is a standard approach.
5. ALWAYS provide a relevant code example if applicable.
6. KEEP IT TECHNICAL. Do not answer personal, political, or non-technical questions.

CONTEXT:
${context || "No specific documentation context found."}
`;

  const result = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(question)
  ]);

  return { answer: result.content };
};
