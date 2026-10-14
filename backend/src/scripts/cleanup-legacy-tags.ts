import dotenv from "dotenv";
import mongoose from "mongoose";

import { TAG_KEYS } from "@sopum-map/shared";

import ShopModel from "../models/shop.model.js";
import VisitLogModel from "../models/visit-log.model.js";

dotenv.config();

const APPLY_FLAG = "--apply";

/** 비밀값을 로그에 남기지 않고 정리 대상 DB에 연결합니다. */
async function connectToTargetDatabase() {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error("MONGODB_URI 환경변수가 필요합니다.");
  }

  await mongoose.connect(mongodbUri);
}

/** 허용 목록 밖의 태그를 가진 문서 수를 확인합니다. */
async function countLegacyTagDocuments() {
  const [shopCount, visitLogCount] = await Promise.all([
    ShopModel.collection.countDocuments({
      tagStats: { $elemMatch: { key: { $nin: TAG_KEYS } } },
    }),
    VisitLogModel.collection.countDocuments({
      selectedTagKeys: { $elemMatch: { $nin: TAG_KEYS } },
    }),
  ]);

  return { shopCount, visitLogCount };
}

/** 상점 통계와 방문 로그에서 폐기된 태그 키만 제거합니다. */
async function removeLegacyTags() {
  const [shops, visitLogs] = await Promise.all([
    ShopModel.updateMany(
      { tagStats: { $elemMatch: { key: { $nin: TAG_KEYS } } } },
      { $pull: { tagStats: { key: { $nin: TAG_KEYS } } } },
    ),
    VisitLogModel.updateMany(
      { selectedTagKeys: { $elemMatch: { $nin: TAG_KEYS } } },
      { $pull: { selectedTagKeys: { $nin: TAG_KEYS } } },
    ),
  ]);

  return {
    modifiedShops: shops.modifiedCount,
    modifiedVisitLogs: visitLogs.modifiedCount,
  };
}

/** 기본 실행은 조회만 하고 --apply가 있을 때만 실제 데이터를 바꿉니다. */
async function cleanupLegacyTags() {
  const shouldApply = process.argv.includes(APPLY_FLAG);

  await connectToTargetDatabase();

  const before = await countLegacyTagDocuments();
  console.log("정리 전", before);

  if (!shouldApply) {
    console.log(`조회만 완료했습니다. 적용하려면 ${APPLY_FLAG}를 사용하세요.`);
    return;
  }

  const result = await removeLegacyTags();
  const after = await countLegacyTagDocuments();

  console.log("정리 결과", result);
  console.log("정리 후", after);

  if (after.shopCount > 0 || after.visitLogCount > 0) {
    throw new Error("허용되지 않은 태그가 남아 있습니다.");
  }
}

cleanupLegacyTags()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
