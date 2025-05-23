import dotenv from "dotenv";
import express from "express";
import feedDocumentsToFaiss from "./helpers/feedDocs.js";
import getAIResponseFromFaiss from "./helpers/getResponse.js";
import getDocsFromRedis, { chatRedisClient } from "./helpers/redis.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.SCRAPPING_SERVER_URL,
    methods: ["GET", "POST"],
  })
);

await chatRedisClient
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
    if (!docs) {
      throw new Error("No documents found");
    }
    const vectordb = await feedDocumentsToFaiss(docs);
    const response = await getAIResponseFromFaiss(vectordb, query, url, key);
    res.json({ response });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error!";
    res.status(500).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
