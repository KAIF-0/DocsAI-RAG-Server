import { config } from "dotenv";
import express from "express";
import feedDocumentsToFaiss from "./helpers/feedDocs.js";
import { getDocsFromRedis, chatRedisClient } from "./helpers/redis.js";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import getAIResponse from "./helpers/getResponse.js";

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

    const response = await getAIResponse(query, url, key);

    res.json({ response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/feedDocs", async (req, res) => {
  try {
    const { key } = req.body;
    const docs = await getDocsFromRedis(key);

    //if docs are found, RAG model is used
    if (docs) {
      await feedDocumentsToFaiss(docs, key);
    }

    res
      .json({
        success: true,
        message: "Docs embeddings successfully stored in Vector Store!",
      })
      .status(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
export default app;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
