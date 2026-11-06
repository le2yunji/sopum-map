import mongoose from "mongoose";

import { env } from "../config/env.js";
import { cleanupVisitLogUploadAssets } from "../services/upload/upload-cleanup.service.js";

/** 예약된 ECS Task에서 오래된 방문 로그 이미지 업로드를 정리합니다. */
async function run(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  try {
    const result = await cleanupVisitLogUploadAssets();
    console.info("방문 로그 이미지 정리를 완료했습니다.", result);
  } finally {
    await mongoose.disconnect();
  }
}

void run().catch((error) => {
  console.error("방문 로그 이미지 정리에 실패했습니다.", error);
  process.exitCode = 1;
});
