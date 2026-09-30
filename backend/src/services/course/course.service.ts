import { Types } from "mongoose";

import {
  CourseListData,
  SHOP_REGION_GROUPS,
  createApiError,
  type CourseDetailData,
  type CreateCourseData,
  type CreateCourseRequest,
  type ShopRegionGroup,
  type UpdateCourseData,
  type UpdateCourseRequest,
} from "@sopum-map/shared";

import ShopLikeModel from "../../models/shop-like.model.js";
import CourseModel from "../../models/course.model.js";
import PickFolderItemModel from "../../models/pick-folder-item.model.js";
import PickFolderModel from "../../models/pick-folder.model.js";
import ShopModel from "../../models/shop.model.js";
import { isMongoDuplicateKeyError } from "../../utils/mongo-error.js";
import { getMainShopImageUrl } from "../../utils/shop-image.js";
import { isCourseShopUnavailable } from "./course.helper.js";

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

/**
 * 코스 상세 정보를 조회합니다.
 */
export async function getCourseDetail(
  userId: string,
  courseId: string,
): Promise<CourseDetailData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectCourseId = new Types.ObjectId(courseId);

  /**
   * 코스를 먼저 조회합니다.
   */
  const course = await CourseModel.findById(objectCourseId).lean();

  if (!course) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  /**
   * 비공개 코스는 작성자만 조회할 수 있습니다.
   *
   * 현재 1차 구현의 사용자 코스는 모두 비공개지만,
   * 추후 공개 기능을 고려해 isPublic 기준으로 검사합니다.
   */
  if (!course.isPublic) {
    const isOwner = course.userId?.toString() === objectUserId.toString();

    if (!isOwner) {
      throw createApiError({
        status: 403,
        code: "COURSE_FORBIDDEN",
        message: "해당 코스에 접근할 수 없습니다.",
      });
    }
  }

  /**
   * Course 자체에 저장된 방문 순서를 기준으로
   * 상점 ID를 정렬합니다.
   */
  const orderedCourseShops = [...course.shops].sort(
    (a, b) => a.order - b.order,
  );

  const shopIds = orderedCourseShops.map((courseShop) => courseShop.shopId);

  /**
   * 상점의 현재 정보를 조회합니다.
   *
   * status 조건을 걸지 않습니다.
   * hidden / temporarily_closed / closed 상태도
   * 코스에서는 계속 조회되어야 합니다.
   */
  const shops = await ShopModel.find({
    _id: {
      $in: shopIds,
    },
  })
    .select({
      _id: 1,

      name: 1,
      address: 1,

      images: 1,

      regionGroup: 1,
      location: 1,

      status: 1,
    })
    .lean();

  const shopMap = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  /**
   * Course에 포함된 Shop 문서가 물리적으로 삭제된 경우
   * 현재 모델만으로는 이름/주소 등을 복구할 수 없습니다.
   *
   * 폐점은 Shop 삭제가 아니라 status=closed로
   * 관리하는 것을 전제로 합니다.
   */
  if (shops.length !== orderedCourseShops.length) {
    throw createApiError({
      status: 500,
      code: "COURSE_SHOP_DATA_MISSING",
      message: "코스에 포함된 일부 상점 정보를 찾을 수 없습니다.",
    });
  }

  const detailShops = orderedCourseShops.map((courseShop) => {
    const shop = shopMap.get(courseShop.shopId.toString());

    if (!shop) {
      throw createApiError({
        status: 500,
        code: "COURSE_SHOP_DATA_MISSING",
        message: "코스에 포함된 일부 상점 정보를 찾을 수 없습니다.",
      });
    }

    const [longitude, latitude] = shop.location.coordinates;

    return {
      id: shop._id.toString(),

      name: shop.name,
      address: shop.address,

      mainImageUrl: getMainShopImageUrl(shop.images ?? []),

      regionGroup: shop.regionGroup,

      latitude,
      longitude,

      status: shop.status,

      isUnavailable: isCourseShopUnavailable(shop.status),

      order: courseShop.order,

      memo: courseShop.memo ?? null,
    };
  });

  return {
    id: course._id.toString(),

    courseType: course.courseType,

    sourceFolderId: course.sourceFolderId?.toString() ?? null,

    title: course.title,

    description: course.description ?? null,

    regionGroup: course.regionGroup,

    isPublic: course.isPublic,

    shops: detailShops,

    createdAt: course.createdAt.toISOString(),

    updatedAt: course.updatedAt.toISOString(),
  };
}

/**
 * 내가 만든 사용자 코스 목록을 조회합니다.
 */
export async function getMyCourses(userId: string): Promise<CourseListData> {
  const objectUserId = new Types.ObjectId(userId);

  const courses = await CourseModel.find({
    userId: objectUserId,
    courseType: "user_created",
  })
    .sort({
      createdAt: -1,
    })
    .select({
      _id: 1,

      sourceFolderId: 1,

      title: 1,
      description: 1,

      regionGroup: 1,

      shops: 1,

      createdAt: 1,
      updatedAt: 1,
    })
    .lean();

  if (courses.length === 0) {
    return {
      items: [],
    };
  }

  /**
   * 각 코스의 첫 번째 방문 상점을 대표 이미지 후보로 사용합니다.
   */
  const firstShopIds = courses
    .map((course) => {
      const firstCourseShop = [...course.shops].sort(
        (a, b) => a.order - b.order,
      )[0];

      return firstCourseShop?.shopId ?? null;
    })
    .filter(
      (shopId): shopId is Types.ObjectId => shopId instanceof Types.ObjectId,
    );

  const shops =
    firstShopIds.length > 0
      ? await ShopModel.find({
          _id: {
            $in: firstShopIds,
          },
        })
          .select({
            _id: 1,
            images: 1,
          })
          .lean()
      : [];

  const shopMap = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  return {
    items: courses.map((course) => {
      const orderedShops = [...course.shops].sort((a, b) => a.order - b.order);

      const firstShop = orderedShops[0];

      const shop = firstShop
        ? shopMap.get(firstShop.shopId.toString())
        : undefined;

      return {
        id: course._id.toString(),

        title: course.title,

        description: course.description ?? null,

        regionGroup: course.regionGroup,

        sourceFolderId: course.sourceFolderId?.toString() ?? null,

        shopCount: course.shops.length,

        mainImageUrl: shop ? getMainShopImageUrl(shop.images ?? []) : null,

        createdAt: course.createdAt.toISOString(),

        updatedAt: course.updatedAt.toISOString(),
      };
    }),
  };
}

/**
 * 사용자 코스를 수정합니다.
 */
export async function updateCourse(
  userId: string,
  courseId: string,
  input: UpdateCourseRequest,
): Promise<UpdateCourseData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectCourseId = new Types.ObjectId(courseId);

  /**
   * 코스 존재 여부를 먼저 확인합니다.
   *
   * 존재 여부와 소유권을 분리해야
   * 다른 사용자의 코스에 403을 반환할 수 있습니다.
   */
  const course = await CourseModel.findById(objectCourseId)
    .select({
      _id: 1,
      userId: 1,
      courseType: 1,
      shops: 1,
    })
    .lean();

  if (!course) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  /**
   * 사용자 생성 코스의 작성자만 수정할 수 있습니다.
   */
  if (
    course.courseType !== "user_created" ||
    !course.userId ||
    course.userId.toString() !== objectUserId.toString()
  ) {
    throw createApiError({
      status: 403,
      code: "COURSE_FORBIDDEN",
      message: "해당 코스를 수정할 권한이 없습니다.",
    });
  }

  const update: {
    title?: string;
    description?: string | null;
    shops?: Array<{
      shopId: Types.ObjectId;
      order: number;
      memo: string | null;
    }>;
    regionGroup?: ShopRegionGroup;
  } = {};

  if (input.title !== undefined) {
    update.title = input.title;
  }

  if (input.description !== undefined) {
    update.description = input.description;
  }

  /**
   * 상점 구성이 변경되는 경우에만
   * 상점 관련 비즈니스 규칙을 검증합니다.
   */
  if (input.shops !== undefined) {
    validateCourseShops(input.shops);

    const orderedCourseShops = [...input.shops].sort(
      (first, second) => first.order - second.order,
    );

    const objectShopIds = orderedCourseShops.map(
      (shop) => new Types.ObjectId(shop.shopId),
    );

    /**
     * 수정 요청에 포함된 모든 상점이 실제로 존재하는지 확인합니다.
     *
     * 수정 시에는 sourceFolderId의 상점으로 제한하지 않습니다.
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

    /**
     * 기존 코스에 없던 상점만 찾아냅니다.
     */
    const currentShopIds = new Set(
      course.shops.map((shop) => shop.shopId.toString()),
    );

    const addedShopIds = orderedCourseShops
      .filter((shop) => !currentShopIds.has(shop.shopId))
      .map((shop) => new Types.ObjectId(shop.shopId));

    /**
     * 새로 추가되는 상점은 현재 사용자가
     * 좋아요한 상점이어야 합니다.
     *
     * 기존 코스에 이미 들어 있던 상점은
     * 좋아요가 해제되어 있어도 유지할 수 있습니다.
     */
    if (addedShopIds.length > 0) {
      const likedShopCount = await ShopLikeModel.countDocuments({
        userId: objectUserId,

        shopId: {
          $in: addedShopIds,
        },
      });

      if (likedShopCount !== addedShopIds.length) {
        throw createApiError({
          status: 400,
          code: "COURSE_SHOP_NOT_LIKED",
          message: "새로 추가하는 상점은 현재 좋아요한 상점이어야 합니다.",
        });
      }
    }

    const shopMap = new Map(shops.map((shop) => [shop._id.toString(), shop]));

    /**
     * 방문 순서대로 regionGroup을 구성합니다.
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

    /**
     * 상점 구성이 수정되면 대표 지역도 다시 계산합니다.
     */
    update.regionGroup = calculateCourseRegionGroup(orderedRegionShops);

    update.shops = orderedCourseShops.map((shop) => ({
      shopId: new Types.ObjectId(shop.shopId),

      order: shop.order,

      memo: shop.memo ?? null,
    }));
  }

  const updatedCourse = await CourseModel.findByIdAndUpdate(
    objectCourseId,
    {
      $set: update,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .select({
      _id: 1,
    })
    .lean();

  /**
   * 조회 이후 삭제되는 경쟁 상황까지 방어합니다.
   */
  if (!updatedCourse) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  return {
    courseId: updatedCourse._id.toString(),
  };
}

/**
 * 사용자 코스를 삭제합니다.
 */
export async function deleteCourse(
  userId: string,
  courseId: string,
): Promise<void> {
  const objectUserId = new Types.ObjectId(userId);
  const objectCourseId = new Types.ObjectId(courseId);

  /**
   * 존재 여부와 소유권을 구분하기 위해
   * 먼저 코스를 조회합니다.
   */
  const course = await CourseModel.findById(objectCourseId)
    .select({
      _id: 1,
      userId: 1,
      courseType: 1,
    })
    .lean();

  if (!course) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }

  /**
   * 사용자 생성 코스의 작성자만 삭제할 수 있습니다.
   */
  if (
    course.courseType !== "user_created" ||
    !course.userId ||
    course.userId.toString() !== objectUserId.toString()
  ) {
    throw createApiError({
      status: 403,
      code: "COURSE_FORBIDDEN",
      message: "해당 코스를 삭제할 권한이 없습니다.",
    });
  }

  const result = await CourseModel.deleteOne({
    _id: objectCourseId,
    userId: objectUserId,
    courseType: "user_created",
  });

  /**
   * 조회 직후 다른 요청에서 삭제된 경우까지 방어합니다.
   */
  if (result.deletedCount === 0) {
    throw createApiError({
      status: 404,
      code: "COURSE_NOT_FOUND",
      message: "코스를 찾을 수 없습니다.",
    });
  }
}
