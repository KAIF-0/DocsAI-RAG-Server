import { config } from "dotenv";
import express from "express";
import feedDocumentsToFaiss from "./helpers/feedDocs.js";
import getAIResponseFromFaiss from "./helpers/getResponse.js";
import { getDocsFromRedis, chatRedisClient } from "./helpers/redis.js";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generatePrompt } from "./helpers/generatePromt.js";

config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.SCRAPPING_SERVER_URL,
    methods: ["GET", "POST"],
  })
);

//google genAI config
export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

chatRedisClient
  .connect()
  .then(() => {
    console.log("CHAT REDIS INSTANCE CONNECTED!");
  })
  .catch((err) => {
    console.log("CHAT REDIS ERROR: ", err);
  });

app.get("/", (req, res) => {
  res.json({ response: "Hello from Docs AI RAG Node.js Server!" });
});

chatRedisClient.on("error", async (err) => {
  console.error("CHAT REDIS ERROR:", err);

  //disconnect first before reconnecting
  try {
    await chatRedisClient.disconnect();
  } catch (disconnectErr) {
    console.error("Error during disconnect:", disconnectErr);
  }

  //sdding a delay
  setTimeout(async () => {
    try {
      await chatRedisClient.connect();
      console.log("CHAT REDIS RECONNECTED");
    } catch (reconnectErr) {
      console.error("Failed to reconnect:", reconnectErr);
    }
  }, 1000);
});

app.post("/getResponse", async (req, res) => {
  try {
    const { query, key, url } = req.body;
    const docs = await getDocsFromRedis(key);
    let response;

    //if docs are found, RAG model is used
    if (docs) {
      const vectordb = await feedDocumentsToFaiss(docs);
      response = await getAIResponseFromFaiss(vectordb, query, url, key);
    } else {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = generatePrompt(query, url, key);
      const result = await model.generateContent(prompt);
      response = result.response.text();
    }

    res.json({ response });
  } catch (error) {
    console.log(error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error!";
    res.status(500).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
