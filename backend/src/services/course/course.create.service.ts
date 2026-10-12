import { Types } from "mongoose";
import {
  createApiError,
  type CreateCourseData,
  type CreateCourseRequest,
  type ShopRegionGroup,
} from "@sopum-map/shared";
import { isMongoDuplicateKeyError } from "../../utils/mongo-error.js";
import PickFolderItemModel from "../../models/pick-folder-item.model.js";
import PickFolderModel from "../../models/pick-folder.model.js";
import ShopModel from "../../models/shop.model.js";
import {
  throwCourseAlreadyExists,
  validateCourseShops,
  validateNewCourseShop,
} from "./course.helper.js";
import CourseModel from "../../models/course.model.js";
import { createCourseShopsWithWalkingMetrics } from "./course-walking-metrics.service.js";

/**
 * 동일한 폴더 + 지역으로 이미 만들어진 코스를 조회
 */
async function getExistingCourseId(
  userId: Types.ObjectId,
  sourceFolderId: Types.ObjectId,
  regionGroup: ShopRegionGroup,
): Promise<string | null> {
  const course = await CourseModel.findOne({
    userId,
    sourceFolderId,
    regionGroup,
    courseType: "user_created",
  })
    .select({
      _id: 1,
    })
    .lean();

  return course?._id.toString() ?? null;
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
   * 폴더 존재 여부 확인
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
   * 다른 사용자의 폴더로 코스를 만들 수 없음
   */
  if (folder.userId.toString() !== objectUserId.toString()) {
    throw createApiError({
      status: 403,
      code: "PICK_FOLDER_FORBIDDEN",
      message: "다른 사용자의 내 픽 폴더에는 접근할 수 없습니다.",
    });
  }

  /**
   * 동일 폴더의 기존 코스를 먼저 확인
   *
   * 동시 요청에 대한 최종 중복 방지는
   * CourseModel의 unique index가 담당
   */
  const existingCourseId = await getExistingCourseId(
    objectUserId,
    objectFolderId,
    input.regionGroup,
  );

  if (existingCourseId) {
    throwCourseAlreadyExists(existingCourseId);
  }

  /**
   * 코스 상점은 방문 순서대로 정규화
   */
  const orderedCourseShops = [...input.shops].sort((a, b) => a.order - b.order);

  const objectShopIds = orderedCourseShops.map(
    (shop) => new Types.ObjectId(shop.shopId),
  );

  /**
   * 생성 시에는 선택한 원본 폴더에 실제로 들어 있는
   * 상점만 사용할 수 있음
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
   * 신규 코스에는
   * active / temporarily_closed 상점만 추가할 수 있으며,
   * hidden / closed / 위치정보가 없는 상점은 제외합니다.
   */
  const shops = await ShopModel.find({
    _id: {
      $in: objectShopIds,
    },
  })
    .select({
      _id: 1,
      regionGroup: 1,
      status: 1,
      location: 1,
    })
    .lean();

  if (shops.length !== orderedCourseShops.length) {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_SHOP",
      message: "존재하지 않는 상점이 포함되어 있습니다.",
    });
  }

  for (const shop of shops) {
    validateNewCourseShop(shop, input.regionGroup);
  }

  const courseShops = await createCourseShopsWithWalkingMetrics(
    orderedCourseShops.map((shop) => ({
      shopId: new Types.ObjectId(shop.shopId),
      order: shop.order,
      memo: shop.memo ?? null,
    })),
    shops,
  );

  try {
    const course = await CourseModel.create({
      courseType: "user_created",

      userId: objectUserId,

      sourceFolderId: objectFolderId,

      title: input.title.trim(),

      description: input.description ?? null,

      regionGroup: input.regionGroup,

      isPublic: input.isPublic,

      shops: courseShops,
    });

    return {
      courseId: course._id.toString(),
    };
  } catch (error) {
    /**
     * 동일 폴더 + 지역에 두 생성 요청이 동시에 들어와
     * unique index에서 충돌한 경우 기존 courseId를 반환
     */

    if (isMongoDuplicateKeyError(error)) {
      const concurrentCourseId = await getExistingCourseId(
        objectUserId,
        objectFolderId,
        input.regionGroup,
      );

      if (concurrentCourseId) {
        throwCourseAlreadyExists(concurrentCourseId);
      }
    }

    throw error;
  }
}
