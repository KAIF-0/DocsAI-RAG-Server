import { Index } from "@upstash/vector";
import { config } from "dotenv";

config();
export const index = Index.fromEnv();
   