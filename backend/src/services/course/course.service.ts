import { Types } from "mongoose";

import {
  SHOP_REGION_GROUPS,
  createApiError,
  type CreateCourseData,
  type CreateCourseRequest,
  type ShopRegionGroup,
} from "@sopum-map/shared";

import CourseModel from "../../models/course.model.js";
import PickFolderItemModel from "../../models/pick-folder-item.model.js";
import PickFolderModel from "../../models/pick-folder.model.js";
import ShopModel from "../../models/shop.model.js";
import { isMongoDuplicateKeyError } from "../../utils/mongo-error.js";

type CourseShopInput = CreateCourseRequest["shops"][number];

type CourseRegionShop = Readonly<{
  regionGroup: ShopRegionGroup;
}>;

/**
 * ShopRegionGroup 값인지 확인합니다.
 */
function isShopRegionGroup(value: unknown): value is ShopRegionGroup {
  return (
    typeof value === "string" &&
    SHOP_REGION_GROUPS.some((regionGroup) => regionGroup === value)
  );
}

/**
 * 코스 상점의 중복 여부와 방문 순서를 검증합니다.
 */
function validateCourseShops(shops: readonly CourseShopInput[]): void {
  const shopIds = shops.map((shop) => shop.shopId);

  if (new Set(shopIds).size !== shopIds.length) {
    throw createApiError({
      status: 400,
      code: "DUPLICATE_COURSE_SHOP",
      message: "같은 상점을 코스에 중복으로 포함할 수 없습니다.",
    });
  }

  const orders = shops.map((shop) => shop.order).sort((a, b) => a - b);

  const hasInvalidOrder = orders.some((order, index) => order !== index + 1);

  if (hasInvalidOrder) {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_SHOP_ORDER",
      message: "방문 순서는 1부터 연속된 숫자여야 합니다.",
    });
  }
}

/**
 * 방문 순서에 따라 코스 대표 지역을 결정합니다.
 *
 * 1. 가장 많은 상점이 속한 지역
 * 2. 동률이면 방문 순서가 가장 빠른 상점의 지역
 */
function calculateCourseRegionGroup(
  shops: readonly CourseRegionShop[],
): ShopRegionGroup {
  const regionCounts = new Map<ShopRegionGroup, number>();

  for (const shop of shops) {
    regionCounts.set(
      shop.regionGroup,
      (regionCounts.get(shop.regionGroup) ?? 0) + 1,
    );
  }

  const maxCount = Math.max(...regionCounts.values());

  const candidateRegionGroups = new Set(
    [...regionCounts.entries()]
      .filter(([, count]) => count === maxCount)
      .map(([regionGroup]) => regionGroup),
  );

  const representativeShop = shops.find((shop) =>
    candidateRegionGroups.has(shop.regionGroup),
  );

  if (!representativeShop) {
    throw createApiError({
      status: 400,
      code: "COURSE_REGION_NOT_FOUND",
      message: "코스의 대표 지역을 결정할 수 없습니다.",
    });
  }

  return representativeShop.regionGroup;
}

/**
 * 동일한 폴더로 이미 만들어진 코스를 조회합니다.
 */
async function getExistingCourseId(
  userId: Types.ObjectId,
  sourceFolderId: Types.ObjectId,
): Promise<string | null> {
  const course = await CourseModel.findOne({
    userId,
    sourceFolderId,
    courseType: "user_created",
  })
    .select({
      _id: 1,
    })
    .lean();

  return course?._id.toString() ?? null;
}

/**
 * 이미 코스가 존재하는 경우 409 오류를 발생시킵니다.
 */
function throwCourseAlreadyExists(courseId: string): never {
  throw createApiError({
    status: 409,
    code: "COURSE_ALREADY_EXISTS",
    message: "해당 내 픽 폴더로 만든 코스가 이미 존재합니다.",
    details: {
      courseId,
    },
  });
}

/**
 * 내 픽 폴더를 기반으로 사용자 코스를 생성합니다.
 */
export async function createCourse(
  userId: string,
  input: CreateCourseRequest,
): Promise<CreateCourseData> {
  const objectUserId = new Types.ObjectId(userId);

  const objectFolderId = new Types.ObjectId(input.sourceFolderId);

  validateCourseShops(input.shops);

  /**
   * 폴더 존재 여부를 확인합니다.
   */
  const folder = await PickFolderModel.findById(objectFolderId)
    .select({
      _id: 1,
      userId: 1,
    })
    .lean();

  if (!folder) {
    throw createApiError({
      status: 404,
      code: "PICK_FOLDER_NOT_FOUND",
      message: "내 픽 폴더를 찾을 수 없습니다.",
    });
  }

  /**
   * 다른 사용자의 폴더로 코스를 만들 수 없습니다.
   */
  if (folder.userId.toString() !== objectUserId.toString()) {
    throw createApiError({
      status: 403,
      code: "PICK_FOLDER_FORBIDDEN",
      message: "다른 사용자의 내 픽 폴더에는 접근할 수 없습니다.",
    });
  }

  /**
   * 동일 폴더의 기존 코스를 먼저 확인합니다.
   *
   * 동시 요청에 대한 최종 중복 방지는
   * CourseModel의 unique index가 담당합니다.
   */
  const existingCourseId = await getExistingCourseId(
    objectUserId,
    objectFolderId,
  );

  if (existingCourseId) {
    throwCourseAlreadyExists(existingCourseId);
  }

  /**
   * 코스 상점은 방문 순서대로 정규화합니다.
   */
  const orderedCourseShops = [...input.shops].sort((a, b) => a.order - b.order);

  const objectShopIds = orderedCourseShops.map(
    (shop) => new Types.ObjectId(shop.shopId),
  );

  /**
   * 생성 시에는 선택한 원본 폴더에 실제로 들어 있는
   * 상점만 사용할 수 있습니다.
   */
  const folderItemCount = await PickFolderItemModel.countDocuments({
    folderId: objectFolderId,

    shopId: {
      $in: objectShopIds,
    },
  });

  if (folderItemCount !== orderedCourseShops.length) {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_FOLDER_SHOP",
      message: "선택한 내 픽 폴더에 포함되지 않은 상점이 있습니다.",
    });
  }

  /**
   * 실제 Shop 문서를 조회합니다.
   *
   * 상점의 status는 코스 생성 가능 여부와 관계없습니다.
   * hidden, temporarily_closed, closed 모두 생성 가능합니다.
   */
  const shops = await ShopModel.find({
    _id: {
      $in: objectShopIds,
    },
  })
    .select({
      _id: 1,
      regionGroup: 1,
    })
    .lean();

  if (shops.length !== orderedCourseShops.length) {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_SHOP",
      message: "존재하지 않는 상점이 포함되어 있습니다.",
    });
  }

  const shopMap = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  /**
   * 방문 순서대로 실제 Shop 정보를 정렬하고
   * regionGroup을 검증합니다.
   */
  const orderedRegionShops: CourseRegionShop[] = orderedCourseShops.map(
    (courseShop) => {
      const shop = shopMap.get(courseShop.shopId);

      if (!shop) {
        throw createApiError({
          status: 400,
          code: "INVALID_COURSE_SHOP",
          message: "존재하지 않는 상점이 포함되어 있습니다.",
        });
      }

      if (!isShopRegionGroup(shop.regionGroup)) {
        throw createApiError({
          status: 400,
          code: "COURSE_SHOP_REGION_REQUIRED",
          message: "지역 정보가 없는 상점은 코스에 추가할 수 없습니다.",
        });
      }

      return {
        regionGroup: shop.regionGroup,
      };
    },
  );

  const regionGroup = calculateCourseRegionGroup(orderedRegionShops);

  try {
    const course = await CourseModel.create({
      courseType: "user_created",

      userId: objectUserId,

      sourceFolderId: objectFolderId,

      title: input.title,

      description: input.description ?? null,

      regionGroup,

      isPublic: false,

      shops: orderedCourseShops.map((shop) => ({
        shopId: new Types.ObjectId(shop.shopId),

        order: shop.order,

        memo: shop.memo ?? null,
      })),
    });

    return {
      courseId: course._id.toString(),
    };
  } catch (error) {
    /**
     * 동일 폴더에 두 생성 요청이 동시에 들어와
     * unique index에서 충돌한 경우 기존 courseId를 반환합니다.
     */
    if (isMongoDuplicateKeyError(error)) {
      const concurrentCourseId = await getExistingCourseId(
        objectUserId,
        objectFolderId,
      );

      if (concurrentCourseId) {
        throwCourseAlreadyExists(concurrentCourseId);
      }
    }

    throw error;
  }
}
