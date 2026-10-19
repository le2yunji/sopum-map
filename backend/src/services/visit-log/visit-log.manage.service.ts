import {
  ACTIVE_TAG_DEFINITIONS,
  createApiError,
  type MyVisitLogListItem,
} from "@sopum-map/shared";
import { Types } from "mongoose";

import VisitLogModel from "../../models/visit-log.model.js";
import { toKoreaDateKey } from "../../utils/korea-date.js";
import { isMongoDuplicateKeyError } from "../../utils/mongo-error.js";
import { createVisitLogImageUrl } from "../upload/image-url.service.js";
import { deleteVisitLogImageObject } from "../upload/s3-image-storage.service.js";
import {
  abortVisitLogImages,
  attachVisitLogImages,
  prepareVisitLogImages,
} from "../upload/upload-finalization.service.js";
import type {
  DeleteVisitLogServiceResult,
  GetMyVisitLogServiceResult,
  GetMyVisitLogsServiceParams,
  GetMyVisitLogsServiceResult,
  UpdateVisitLogServiceInput,
  UpdateVisitLogServiceResult,
} from "./visit-log.service.types.js";

const ACTIVE_TAG_KEYS = new Set<string>(
  ACTIVE_TAG_DEFINITIONS.map((tag) => tag.key),
);

type MyVisitLogFacet = Readonly<{
  items?: MyVisitLogProjection[];
  summary?: ReadonlyArray<Readonly<{ totalCount: number; uniqueShopCount: number }>>;
}>;

type MyVisitLogProjection = Omit<MyVisitLogListItem, "images"> &
  Readonly<{ imageKeys: string[] }>;

/** 조회용 Object Key를 외부 이미지 URL로 바꿉니다. */
function mapMyVisitLogImages(item: MyVisitLogProjection): MyVisitLogListItem {
  const { imageKeys, ...rest } = item;
  return {
    ...rest,
    images: imageKeys.map((key) => ({ key, url: createVisitLogImageUrl(key) })),
  };
}

/** 방문 로그가 없거나 본인 소유가 아닐 때 같은 오류를 반환합니다. */
function createVisitLogNotFoundError() {
  return createApiError({
    status: 404,
    code: "VISIT_LOG_NOT_FOUND",
    message: "방문 로그를 찾을 수 없습니다.",
  });
}

/** 동일 상점·한국 날짜의 활성 로그 중복을 알립니다. */
function createDuplicateVisitLogError() {
  return createApiError({
    status: 409,
    code: "VISIT_LOG_ALREADY_EXISTS",
    message: "같은 날짜의 방문 로그가 이미 있습니다.",
  });
}

/** 수정 요청에서도 폐기된 태그가 다시 저장되지 않게 합니다. */
function validateActiveTagKeys(tagKeys: readonly string[]): void {
  if (tagKeys.some((tagKey) => !ACTIVE_TAG_KEYS.has(tagKey))) {
    throw createApiError({
      status: 400,
      code: "INVALID_VISIT_LOG_TAG",
      message: "선택할 수 없는 방문 태그가 포함되어 있습니다.",
    });
  }
}

/** 수정 요청의 기존 이미지는 현재 방문 로그에 속한 키만 허용합니다. */
function validateExistingImageKeys(
  requestedKeys: readonly string[],
  currentKeys: ReadonlySet<string>,
): void {
  if (
    requestedKeys.some((key) => !currentKeys.has(key)) ||
    new Set(requestedKeys).size !== requestedKeys.length
  ) {
    throw createApiError({
      status: 400,
      code: "INVALID_VISIT_LOG_IMAGE",
      message: "방문 로그에 속하지 않은 이미지가 포함되어 있습니다.",
    });
  }
}

/** DB에서 참조가 제거된 이미지의 S3 정리를 시도하고 실패는 정리 작업에 맡깁니다. */
async function deleteUnusedImageObjects(keys: readonly string[]): Promise<void> {
  const results = await Promise.allSettled(
    keys.map((key) => deleteVisitLogImageObject(key)),
  );
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("사용하지 않는 방문 로그 이미지 삭제에 실패했습니다.", result.reason);
    }
  });
}

/** 내 목록과 단건 조회가 같은 안전한 표시 형태를 사용하게 합니다. */
function createMyVisitLogPipeline(match: Record<string, unknown>) {
  return [
    { $match: match },
    {
      $lookup: {
        from: "shops",
        localField: "shopId",
        foreignField: "_id",
        as: "shop",
      },
    },
    { $unwind: "$shop" },
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        shop: {
          id: { $toString: "$shop._id" },
          name: "$shop.name",
          address: "$shop.address",
          imageUrl: {
            $ifNull: [
              {
                $getField: {
                  field: "imageUrl",
                  input: { $arrayElemAt: ["$shop.images", 0] },
                },
              },
              null,
            ],
          },
        },
        selectedTagKeys: { $ifNull: ["$selectedTagKeys", []] },
        content: { $ifNull: ["$content", null] },
        imageKeys: { $ifNull: ["$images.key", []] },
        visitedAt: { $dateToString: { date: "$visitedAt" } },
        createdAt: { $dateToString: { date: "$createdAt" } },
        updatedAt: { $dateToString: { date: "$updatedAt" } },
      },
    },
  ];
}

/** 로그인 사용자의 활성 방문 로그를 최신 방문일순으로 조회합니다. */
export async function getMyVisitLogs(
  params: GetMyVisitLogsServiceParams,
): Promise<GetMyVisitLogsServiceResult> {
  const { userId, page, limit } = params;
  const skip = (page - 1) * limit;
  const match = { userId: new Types.ObjectId(userId), status: "active" };
  const [result = {}] = await VisitLogModel.aggregate<MyVisitLogFacet>([
    { $match: match },
    { $sort: { visitedAt: -1, createdAt: -1, _id: -1 } },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          ...createMyVisitLogPipeline({}),
        ],
        summary: [
          { $group: { _id: null, totalCount: { $sum: 1 }, shopIds: { $addToSet: "$shopId" } } },
          { $project: { _id: 0, totalCount: 1, uniqueShopCount: { $size: "$shopIds" } } },
        ],
      },
    },
  ]);
  const summary = result.summary?.[0] ?? { totalCount: 0, uniqueShopCount: 0 };
  const totalPages = Math.ceil(summary.totalCount / limit);

  return {
    items: (result.items ?? []).map(mapMyVisitLogImages),
    pagination: {
      totalCount: summary.totalCount,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
    },
    summary,
  };
}

/** 로그인 사용자가 직접 연 수정 화면에 본인 활성 로그만 제공합니다. */
export async function getMyVisitLog(
  userId: string,
  visitLogId: string,
): Promise<GetMyVisitLogServiceResult> {
  const [item] = await VisitLogModel.aggregate<MyVisitLogProjection>(
    createMyVisitLogPipeline({
      _id: new Types.ObjectId(visitLogId),
      userId: new Types.ObjectId(userId),
      status: "active",
    }),
  );

  if (!item) throw createVisitLogNotFoundError();
  return mapMyVisitLogImages(item);
}

/** 본인 활성 방문 로그의 방문일·태그·내용만 수정합니다. */
export async function updateVisitLog(
  userId: string,
  visitLogId: string,
  input: UpdateVisitLogServiceInput,
): Promise<UpdateVisitLogServiceResult> {
  validateActiveTagKeys(input.selectedTagKeys);
  const objectId = new Types.ObjectId(visitLogId);
  const objectUserId = new Types.ObjectId(userId);
  const current = await VisitLogModel.findOne({
    _id: objectId,
    userId: objectUserId,
    status: "active",
  }).lean();

  if (!current) throw createVisitLogNotFoundError();

  const visitedAt = new Date(input.visitedAt);
  const visitedDate = toKoreaDateKey(visitedAt);
  const duplicate = await VisitLogModel.exists({
    _id: { $ne: objectId },
    userId: objectUserId,
    shopId: current.shopId,
    visitedDate,
    status: "active",
  });
  if (duplicate) throw createDuplicateVisitLogError();

  const currentImageKeys = current.images.map((image) => image.key);
  const imageInputs = input.images;
  const existingImageKeys = imageInputs
    ?.filter((image) => image.type === "existing")
    .map((image) => image.key) ?? [];
  validateExistingImageKeys(existingImageKeys, new Set(currentImageKeys));

  const newUploadIds = imageInputs
    ?.filter((image) => image.type === "new")
    .map((image) => image.uploadId) ?? [];
  const preparedImages = await prepareVisitLogImages(userId, newUploadIds);
  const preparedImageByUploadId = new Map(
    newUploadIds.map((uploadId, index) => [
      uploadId,
      preparedImages.images[index],
    ]),
  );
  const nextImages = imageInputs?.map((image) => {
    if (image.type === "existing") return { key: image.key };
    const preparedImage = preparedImageByUploadId.get(image.uploadId);
    if (!preparedImage) {
      throw createApiError({
        status: 400,
        code: "INVALID_IMAGE_UPLOAD",
        message: "사용할 수 없는 이미지 업로드가 포함되어 있습니다.",
      });
    }
    return { key: preparedImage.key };
  });
  const removedImageKeys = imageInputs
    ? currentImageKeys.filter(
        (key) => !nextImages?.some((image) => image.key === key),
      )
    : [];

  try {
    const updated = await VisitLogModel.findOneAndUpdate(
      { _id: objectId, userId: objectUserId, status: "active" },
      {
        $set: {
          visitedAt,
          visitedDate,
          selectedTagKeys: [...input.selectedTagKeys],
          content: input.content?.trim() || null,
          ...(nextImages ? { images: nextImages } : {}),
        },
      },
      { new: true },
    );
    if (!updated) throw createVisitLogNotFoundError();
  } catch (error) {
    await abortVisitLogImages(preparedImages, error);
    if (isMongoDuplicateKeyError(error)) throw createDuplicateVisitLogError();
    throw error;
  }

  await attachVisitLogImages(preparedImages, objectId);
  await deleteUnusedImageObjects(removedImageKeys);

  return { visitLogId };
}

/** 본인 활성 방문 로그를 복구 가능한 삭제 상태로 바꿉니다. */
export async function deleteVisitLog(
  userId: string,
  visitLogId: string,
): Promise<DeleteVisitLogServiceResult> {
  const deleted = await VisitLogModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(visitLogId),
      userId: new Types.ObjectId(userId),
      status: "active",
    },
    { $set: { status: "deleted" } },
    { new: true },
  );
  if (!deleted) throw createVisitLogNotFoundError();
  await deleteUnusedImageObjects(deleted.images.map((image) => image.key));
  return { visitLogId };
}
