import {
  VISIT_LOG_IMAGE_MAX_BYTES,
  VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE,
  createApiError,
} from "@sopum-map/shared";
import { Types } from "mongoose";

import UploadAssetModel from "../../models/upload-asset.model.js";
import {
  copyVisitLogImage,
  deleteVisitLogImageObject,
  inspectTemporaryVisitLogImage,
} from "./s3-image-storage.service.js";

type ClaimedUpload = Readonly<{
  id: Types.ObjectId;
  temporaryKey: string;
  finalKey: string;
  expectedSize: number;
}>;

export type PreparedVisitLogImages = Readonly<{
  uploads: readonly ClaimedUpload[];
  images: readonly Readonly<{ key: string }>[];
}>;

/** 사용할 수 없는 업로드 ID를 소유권 정보 노출 없이 같은 오류로 알립니다. */
function createInvalidUploadError() {
  return createApiError({
    status: 400,
    code: "INVALID_IMAGE_UPLOAD",
    message: "사용할 수 없는 이미지 업로드가 포함되어 있습니다.",
  });
}

/** 중간 실패한 선점 상태와 복사 객체를 다음 재시도가 가능하게 되돌립니다. */
async function rollbackClaimedUploads(
  uploads: readonly ClaimedUpload[],
  copiedFinalKeys: readonly string[],
  error: unknown,
): Promise<void> {
  await Promise.allSettled(
    copiedFinalKeys.map((key) => deleteVisitLogImageObject(key)),
  );
  const lastError = error instanceof Error ? error.message.slice(0, 500) : "unknown";
  await UploadAssetModel.updateMany(
    { _id: { $in: uploads.map((upload) => upload.id) }, status: "finalizing" },
    {
      $set: { status: "pending", finalizingAt: null, lastError },
    },
  );
}

/** 업로드 ID를 선점하고 S3 실체를 검증한 뒤 최종 경로에 복사합니다. */
export async function prepareVisitLogImages(
  userId: string,
  uploadIds: readonly string[],
): Promise<PreparedVisitLogImages> {
  if (uploadIds.length === 0) return { uploads: [], images: [] };

  const objectUserId = new Types.ObjectId(userId);
  const claimed: ClaimedUpload[] = [];
  const copiedFinalKeys: string[] = [];

  try {
    for (const uploadId of uploadIds) {
      const asset = await UploadAssetModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(uploadId),
          userId: objectUserId,
          status: "pending",
        },
        {
          $set: {
            status: "finalizing",
            finalizingAt: new Date(),
            lastError: null,
          },
        },
        { new: true },
      ).lean();

      if (!asset) throw createInvalidUploadError();
      claimed.push({
        id: asset._id,
        temporaryKey: asset.temporaryKey,
        finalKey: asset.finalKey,
        expectedSize: asset.expectedSize,
      });
    }

    for (const upload of claimed) {
      const object = await inspectTemporaryVisitLogImage(upload.temporaryKey);
      const isValid =
        object.contentLength === upload.expectedSize &&
        object.contentLength <= VISIT_LOG_IMAGE_MAX_BYTES &&
        object.contentType === VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE &&
        object.uploadId === upload.id.toString() &&
        object.hasWebpSignature;

      if (!isValid) throw createInvalidUploadError();
      await copyVisitLogImage(upload.temporaryKey, upload.finalKey);
      copiedFinalKeys.push(upload.finalKey);
    }

    return {
      uploads: claimed,
      images: claimed.map((upload) => ({ key: upload.finalKey })),
    };
  } catch (error) {
    await rollbackClaimedUploads(claimed, copiedFinalKeys, error);
    throw error;
  }
}

/** DB에 연결된 업로드를 완료 처리하고 임시 객체를 정리합니다. */
export async function attachVisitLogImages(
  prepared: PreparedVisitLogImages,
  visitLogId: Types.ObjectId,
): Promise<void> {
  if (prepared.uploads.length === 0) return;

  try {
    await UploadAssetModel.updateMany(
      {
        _id: { $in: prepared.uploads.map((upload) => upload.id) },
        status: "finalizing",
      },
      {
        $set: {
          status: "attached",
          visitLogId,
          attachedAt: new Date(),
          lastError: null,
        },
      },
    );
  } catch (error) {
    console.error("방문 로그 이미지 상태 확정에 실패했습니다.", error);
    return;
  }

  const deletionResults = await Promise.allSettled(
    prepared.uploads.map((upload) =>
      deleteVisitLogImageObject(upload.temporaryKey),
    ),
  );
  deletionResults.forEach((result) => {
    if (result.status === "rejected") {
      console.error("방문 로그 임시 이미지 삭제에 실패했습니다.", result.reason);
    }
  });
}

/** 방문 로그 DB 저장 전에 실패하면 최종 복사본과 선점 상태를 되돌립니다. */
export async function abortVisitLogImages(
  prepared: PreparedVisitLogImages,
  error: unknown,
): Promise<void> {
  await rollbackClaimedUploads(
    prepared.uploads,
    prepared.uploads.map((upload) => upload.finalKey),
    error,
  );
}
