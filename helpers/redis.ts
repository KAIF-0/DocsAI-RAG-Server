import { createClient } from "redis";
import * as dotenv from "dotenv";

dotenv.config();
// console.log(process.env.REDIS_CHAT_INSTANCE_URL);
export const chatRedisClient = createClient({
  url: process.env.REDIS_CHAT_INSTANCE_URL,
});

export default async function getDocsFromRedis(key: string): Promise<string> {
  try {
    const result = await chatRedisClient.get(key);
    return result || "";
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Error in getting data from Redis: " + errorMessage);
  }
}
