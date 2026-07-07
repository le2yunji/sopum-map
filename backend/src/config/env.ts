import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["MONGODB_URI"] as const;

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} 환경변수가 필요합니다.`);
  }
});

export const env = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  mongodbUri: process.env.MONGODB_URI as string,
};
