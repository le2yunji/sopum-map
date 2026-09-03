import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "MONGODB_URI",
  "KAKAO_REST_API_KEY",
  "KAKAO_CLIENT_SECRET",
  "KAKAO_REDIRECT_URI",
] as const;

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} 환경변수가 필요합니다.`);
  }
});

const port = Number(process.env.PORT ?? 4000);

if (Number.isNaN(port)) {
  throw new Error("PORT는 숫자여야 합니다.");
}

export const env = {
  port,

  nodeEnv: process.env.NODE_ENV ?? "development",

  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",

  mongodbUri: process.env.MONGODB_URI as string,

  naverClientId: process.env.NAVER_CLIENT_ID || "",

  naverClientSecret: process.env.NAVER_CLIENT_SECRET || "",

  kakaoRestApiKey: process.env.KAKAO_REST_API_KEY as string,

  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET as string,

  kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI as string,
};
