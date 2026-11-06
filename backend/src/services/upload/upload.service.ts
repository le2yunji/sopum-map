import {
  createApiError,
  type CreateVisitLogImageUploadData,
  type CreateVisitLogImageUploadRequest,
} from "@sopum-map/shared";
import { randomUUID } from "node:crypto";
import { Types } from "mongoose";

import UploadAssetModel from "../../models/upload-asset.model.js";
import { createVisitLogImagePresignedPost } from "./s3-image-storage.service.js";
import {
  VISIT_LOG_PENDING_UPLOAD_LIMIT,
  VISIT_LOG_UPLOAD_EXPIRES_SECONDS,
  VISIT_LOG_UPLOAD_ISSUE_LIMIT_PER_HOUR,
} from "./upload.constants.js";

/** 과도한 미확정 업로드와 반복 서명 발급을 사용자 단위로 제한합니다. */
async function validateUploadIssueLimit(userId: Types.ObjectId): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [pendingCount, recentIssueCount] = await Promise.all([
    UploadAssetModel.countDocuments({
      userId,
      status: { $in: ["pending", "finalizing"] },
    }),
    UploadAssetModel.countDocuments({ userId, createdAt: { $gte: oneHourAgo } }),
  ]);

  if (
    pendingCount >= VISIT_LOG_PENDING_UPLOAD_LIMIT ||
    recentIssueCount >= VISIT_LOG_UPLOAD_ISSUE_LIMIT_PER_HOUR
  ) {
    throw createApiError({
      status: 429,
      code: "IMAGE_UPLOAD_LIMIT_EXCEEDED",
      message: "이미지 업로드 요청이 많습니다. 잠시 후 다시 시도해 주세요.",
    });
  }
}

/** 로그인 사용자의 방문 로그 이미지용 Presigned POST를 발급합니다. */
export async function createVisitLogImageUpload(
  userId: string,
  input: CreateVisitLogImageUploadRequest,
): Promise<CreateVisitLogImageUploadData> {
  const objectUserId = new Types.ObjectId(userId);
  await validateUploadIssueLimit(objectUserId);

  const fileId = randomUUID();
  const uploadAsset = await UploadAssetModel.create({
    userId: objectUserId,
    temporaryKey: `temporary/${userId}/${fileId}.webp`,
    finalKey: `visit-logs/${userId}/${fileId}.webp`,
    expectedSize: input.fileSize,
    contentType: input.contentType,
    status: "pending",
  });
  const uploadId = uploadAsset._id.toString();

  try {
    const post = await createVisitLogImagePresignedPost({
      key: uploadAsset.temporaryKey,
      uploadId,
    });

    return {
      uploadId,
      url: post.url,
      fields: post.fields,
      expiresIn: VISIT_LOG_UPLOAD_EXPIRES_SECONDS,
    };
  } catch (error) {
    await UploadAssetModel.deleteOne({ _id: uploadAsset._id, status: "pending" });
    throw error;
  }
}
