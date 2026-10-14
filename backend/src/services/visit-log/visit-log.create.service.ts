import {
  ACTIVE_TAG_DEFINITIONS,
  createApiError,
} from "@sopum-map/shared";
import { Types } from "mongoose";

import ShopModel from "../../models/shop.model.js";
import VisitLogModel from "../../models/visit-log.model.js";
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

/** 이미지 업로드가 준비되기 전에는 이미지 없는 로그만 생성합니다. */
function validateImageKeys(imageKeys: readonly string[]): void {
  if (imageKeys.length > 0) {
    throw createApiError({
      status: 400,
      code: "VISIT_LOG_IMAGE_NOT_SUPPORTED",
      message: "방문 로그 이미지 업로드는 아직 지원하지 않습니다.",
    });
  }
}

/** 로그인 사용자의 공개 방문 로그를 생성합니다. */
export async function createVisitLog(
  userId: string,
  shopId: string,
  input: CreateVisitLogServiceInput,
): Promise<CreateVisitLogServiceResult> {
  const imageKeys = input.imageKeys ?? [];

  validateImageKeys(imageKeys);
  validateActiveTagKeys(input.selectedTagKeys);

  const objectUserId = new Types.ObjectId(userId);
  const objectShopId = new Types.ObjectId(shopId);
  const shopExists = await ShopModel.exists({
    _id: objectShopId,
    status: "active",
  });

  if (!shopExists) {
    throw createApiError({
      status: 404,
      code: "SHOP_NOT_FOUND",
      message: "상점을 찾을 수 없습니다.",
    });
  }

  const content = input.content?.trim() || null;
  const visitLog = await VisitLogModel.create({
    userId: objectUserId,
    shopId: objectShopId,
    visitedAt: new Date(input.visitedAt),
    selectedTagKeys: [...input.selectedTagKeys],
    content,
    imageKeys: [...imageKeys],
    status: "active",
  });

  return { visitLogId: visitLog._id.toString() };
}
