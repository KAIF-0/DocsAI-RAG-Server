declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_API_KEY: string;
      REDIS_CHAT_INSTANCE_URL: string;
    }
  }
}

export {};
