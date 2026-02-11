import { StateGraph, END } from "@langchain/langgraph";
import { validateNode } from "./nodes/validate.js";
import { retrieveNode } from "./nodes/retrieve.js";
import { generateNode } from "./nodes/generate.js";
import { rejectNode } from "./nodes/reject.js";

// Define state channels with "overwrite" behavior
const graphChannels = {
  question: { value: (x, y) => y ?? x, default: () => null },
  key: { value: (x, y) => y ?? x, default: () => null },
  url: { value: (x, y) => y ?? x, default: () => null },
  classification: { value: (x, y) => y ?? x, default: () => null },
  context: { value: (x, y) => y ?? x, default: () => null },
  answer: { value: (x, y) => y ?? x, default: () => null }
};

const workflow = new StateGraph({
  channels: graphChannels
});

// Add nodes
workflow.addNode("validate", validateNode);
workflow.addNode("retrieve", retrieveNode);
workflow.addNode("generate", generateNode);
workflow.addNode("reject", rejectNode);

// Set entry point
workflow.setEntryPoint("validate");

// Add edges
workflow.addConditionalEdges(
  "validate",
  (state) => {
    if (state.classification === "technical_doc_related") {
      return "retrieve";
    } else {
      return "reject";
    }
  }
);

workflow.addEdge("retrieve", "generate");
workflow.addEdge("generate", END);
workflow.addEdge("reject", END);

// Compile the graph
export const graph = workflow.compile();
