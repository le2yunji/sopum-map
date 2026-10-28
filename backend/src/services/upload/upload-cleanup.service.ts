import UploadAssetModel from "../../models/upload-asset.model.js";
import VisitLogModel from "../../models/visit-log.model.js";
import { deleteVisitLogImageObject } from "./s3-image-storage.service.js";

const ORPHAN_AGE_MS = 24 * 60 * 60 * 1000;
const CLEANUP_BATCH_SIZE = 100;

type CleanupResult = {
  inspected: number;
  deleted: number;
  healed: number;
  failed: number;
};

/** 두 S3 경로 삭제가 모두 끝난 뒤에만 관리 레코드를 제거합니다. */
async function deleteAssetObjects(asset: {
  _id: unknown;
  temporaryKey: string;
  finalKey: string;
}): Promise<boolean> {
  try {
    await deleteVisitLogImageObject(asset.temporaryKey);
    await deleteVisitLogImageObject(asset.finalKey);
    await UploadAssetModel.deleteOne({ _id: asset._id });
    return true;
  } catch (error) {
    await UploadAssetModel.updateOne(
      { _id: asset._id },
      {
        $set: {
          lastError: error instanceof Error ? error.message.slice(0, 500) : "unknown",
        },
      },
    );
    return false;
  }
}

/** 24시간 지난 미연결 객체와 삭제된 로그의 최종 이미지를 멱등하게 정리합니다. */
export async function cleanupVisitLogUploadAssets(
  now = new Date(),
): Promise<CleanupResult> {
  const result: CleanupResult = { inspected: 0, deleted: 0, healed: 0, failed: 0 };
  const cutoff = new Date(now.getTime() - ORPHAN_AGE_MS);
  let lastId: unknown;

  while (true) {
    const assets = await UploadAssetModel.find({
      ...(lastId ? { _id: { $gt: lastId } } : {}),
      $or: [
        { status: { $in: ["pending", "finalizing"] }, createdAt: { $lt: cutoff } },
        { status: "attached" },
      ],
    })
      .sort({ _id: 1 })
      .limit(CLEANUP_BATCH_SIZE)
      .lean();
    if (assets.length === 0) break;

    for (const asset of assets) {
      result.inspected += 1;
      lastId = asset._id;
      const activeReference = await VisitLogModel.findOne({
        ...(asset.visitLogId ? { _id: asset.visitLogId } : {}),
        status: "active",
        "images.key": asset.finalKey,
      })
        .select({ _id: 1 })
        .lean();

      if (activeReference) {
        if (asset.status === "finalizing") {
          await UploadAssetModel.updateOne(
            { _id: asset._id, status: "finalizing" },
            {
              $set: {
                status: "attached",
                visitLogId: activeReference._id,
                attachedAt: now,
                lastError: null,
              },
            },
          );
          result.healed += 1;
        }
        try {
          await deleteVisitLogImageObject(asset.temporaryKey);
        } catch (error) {
          result.failed += 1;
          console.error("연결된 임시 이미지 정리에 실패했습니다.", error);
        }
        continue;
      }

      if (await deleteAssetObjects(asset)) result.deleted += 1;
      else result.failed += 1;
    }

    if (assets.length < CLEANUP_BATCH_SIZE) break;
  }

  return result;
}
