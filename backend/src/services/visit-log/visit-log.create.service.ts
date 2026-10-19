import {
  ACTIVE_TAG_DEFINITIONS,
  createApiError,
  type CheckVisitLogAvailabilityData,
} from "@sopum-map/shared";
import { Types } from "mongoose";

import ShopModel from "../../models/shop.model.js";
import VisitLogModel from "../../models/visit-log.model.js";
import { toKoreaDateKey } from "../../utils/korea-date.js";
import { isMongoDuplicateKeyError } from "../../utils/mongo-error.js";
import {
  abortVisitLogImages,
  attachVisitLogImages,
  prepareVisitLogImages,
} from "../upload/upload-finalization.service.js";
import type {
  CreateVisitLogServiceInput,
  CreateVisitLogServiceResult,
} from "./visit-log.service.types.js";

const ACTIVE_VISIT_LOG_TAG_KEYS = new Set<string>(
  ACTIVE_TAG_DEFINITIONS.map((tag) => tag.key),
);

/** 새 방문 로그에 활성 공용 태그만 포함되었는지 확인합니다. */
function validateActiveTagKeys(tagKeys: readonly string[]): void {
  if (tagKeys.some((tagKey) => !ACTIVE_VISIT_LOG_TAG_KEYS.has(tagKey))) {
    throw createApiError({
      status: 400,
      code: "INVALID_VISIT_LOG_TAG",
      message: "선택할 수 없는 방문 태그가 포함되어 있습니다.",
    });
  }
}

/** 동일한 한국 날짜에 이미 활성 로그가 있음을 공통 API 오류로 알립니다. */
function createDuplicateVisitLogError() {
  return createApiError({
    status: 409,
    code: "VISIT_LOG_ALREADY_EXISTS",
    message: "같은 날짜의 방문 로그가 이미 있습니다.",
  });
}

/** 상점이 방문 로그를 받을 수 있는 활성 상태인지 확인합니다. */
async function validateActiveShop(shopId: Types.ObjectId): Promise<void> {
  const shopExists = await ShopModel.exists({ _id: shopId, status: "active" });

  if (!shopExists) {
    throw createApiError({
      status: 404,
      code: "SHOP_NOT_FOUND",
      message: "상점을 찾을 수 없습니다.",
    });
  }
}

/** 같은 사용자의 같은 상점·한국 날짜 활성 로그를 찾습니다. */
async function hasDuplicateVisitLog(
  userId: Types.ObjectId,
  shopId: Types.ObjectId,
  visitedDate: string,
): Promise<boolean> {
  const duplicateVisitLog = await VisitLogModel.exists({
    userId,
    shopId,
    visitedDate,
    status: "active",
  });

  return Boolean(duplicateVisitLog);
}

/** 선택한 방문일에 새 방문 로그를 작성할 수 있는지 미리 확인합니다. */
export async function checkVisitLogAvailability(
  userId: string,
  shopId: string,
  visitedAtValue: string,
): Promise<CheckVisitLogAvailabilityData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectShopId = new Types.ObjectId(shopId);
  const visitedDate = toKoreaDateKey(new Date(visitedAtValue));

  await validateActiveShop(objectShopId);
  const hasDuplicate = await hasDuplicateVisitLog(
    objectUserId,
    objectShopId,
    visitedDate,
  );

  return { canCreate: !hasDuplicate };
}

/** 로그인 사용자의 공개 방문 로그를 생성합니다. */
export async function createVisitLog(
  userId: string,
  shopId: string,
  input: CreateVisitLogServiceInput,
): Promise<CreateVisitLogServiceResult> {
  const imageUploadIds = input.imageUploadIds ?? [];
  validateActiveTagKeys(input.selectedTagKeys);

  const objectUserId = new Types.ObjectId(userId);
  const objectShopId = new Types.ObjectId(shopId);
  const visitedAt = new Date(input.visitedAt);
  const visitedDate = toKoreaDateKey(visitedAt);
  await validateActiveShop(objectShopId);

  if (await hasDuplicateVisitLog(objectUserId, objectShopId, visitedDate)) {
    throw createDuplicateVisitLogError();
  }

  const content = input.content?.trim() || null;
  const preparedImages = await prepareVisitLogImages(userId, imageUploadIds);
  let visitLog;

  try {
    visitLog = await VisitLogModel.create({
      userId: objectUserId,
      shopId: objectShopId,
      visitedAt,
      visitedDate,
      selectedTagKeys: [...input.selectedTagKeys],
      content,
      images: preparedImages.images.map((image) => ({ key: image.key })),
      status: "active",
    });
  } catch (error) {
    await abortVisitLogImages(preparedImages, error);
    if (isMongoDuplicateKeyError(error)) {
      throw createDuplicateVisitLogError();
    }

    throw error;
  }

  await attachVisitLogImages(preparedImages, visitLog._id);

  return { visitLogId: visitLog._id.toString() };
}
