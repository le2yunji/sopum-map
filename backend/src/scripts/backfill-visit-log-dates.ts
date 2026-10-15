import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";

import VisitLogModel from "../models/visit-log.model.js";
import { toKoreaDateKey } from "../utils/korea-date.js";

dotenv.config();

const APPLY_FLAG = "--apply";

type VisitLogDateSource = Readonly<{
  _id: unknown;
  userId: unknown;
  shopId: unknown;
  visitedAt: Date;
  visitedDate?: string;
  status: string;
}>;

type VisitLogDateUpdate = Readonly<{ id: string; visitedDate: string }>;
type DuplicateVisitLogDate = Readonly<{
  userId: string;
  shopId: string;
  visitedDate: string;
  visitLogIds: readonly string[];
}>;

/** 백필 대상과 활성 중복 그룹을 쓰기 전에 계산합니다. */
export function analyzeVisitLogDates(documents: readonly VisitLogDateSource[]): {
  updates: VisitLogDateUpdate[];
  duplicates: DuplicateVisitLogDate[];
} {
  const updates: VisitLogDateUpdate[] = [];
  const activeGroups = new Map<string, DuplicateVisitLogDate>();

  for (const document of documents) {
    const id = String(document._id);
    const userId = String(document.userId);
    const shopId = String(document.shopId);
    const visitedDate = document.visitedDate ?? toKoreaDateKey(document.visitedAt);

    if (!document.visitedDate) {
      updates.push({ id, visitedDate });
    }

    if (document.status !== "active") {
      continue;
    }

    const key = `${userId}:${shopId}:${visitedDate}`;
    const existing = activeGroups.get(key);
    activeGroups.set(key, {
      userId,
      shopId,
      visitedDate,
      visitLogIds: [...(existing?.visitLogIds ?? []), id],
    });
  }

  return {
    updates,
    duplicates: [...activeGroups.values()].filter(
      (group) => group.visitLogIds.length > 1,
    ),
  };
}

/** 기본 dry-run 뒤 안전 조건을 만족할 때만 날짜 키를 저장합니다. */
async function backfillVisitLogDates(): Promise<void> {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("MONGODB_URI 환경변수가 필요합니다.");
  }

  await mongoose.connect(mongodbUri);
  const documents = await VisitLogModel.find({})
    .select({ _id: 1, userId: 1, shopId: 1, visitedAt: 1, visitedDate: 1, status: 1 })
    .lean();
  const analysis = analyzeVisitLogDates(documents);

  console.log("방문일 백필 대상", analysis.updates.length);
  console.log("활성 중복 그룹", analysis.duplicates);

  if (analysis.duplicates.length > 0) {
    throw new Error("활성 중복 방문 로그가 있어 백필을 중단합니다.");
  }

  if (!process.argv.includes(APPLY_FLAG)) {
    console.log(`조회만 완료했습니다. 적용하려면 ${APPLY_FLAG}를 사용하세요.`);
    return;
  }

  if (analysis.updates.length > 0) {
    await VisitLogModel.bulkWrite(
      analysis.updates.map((update) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(update.id) },
          update: { $set: { visitedDate: update.visitedDate } },
        },
      })),
    );
  }

  await VisitLogModel.syncIndexes();
  console.log("방문일 백필과 인덱스 적용을 완료했습니다.");
}

const isDirectExecution = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  backfillVisitLogDates()
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}
