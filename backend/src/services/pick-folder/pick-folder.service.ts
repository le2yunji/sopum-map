// src/services/pick-folder/pick-folder.service.ts

import { Types } from "mongoose";
import { createApiError } from "@sopum-map/shared";
import type {
  CreatePickFolderRequest,
  PickFolder,
  PickFolderListData,
  ShopFolderIdsData,
  UpdatePickFolderOrderRequest,
  UpdatePickFolderRequest,
  UpdateShopFolderIdsRequest,
  AddShopToFolderRequest,
  PickFolderShopData,
  PickFolderShopListData,
  ShopRegionGroup,
  PickFolderCourseRegionsData,
} from "@sopum-map/shared";

import PickFolderModel from "../../models/pick-folder.model.js";
import PickFolderItemModel from "../../models/pick-folder-item.model.js";
import ShopLikeModel from "../../models/shop-like.model.js";
import ShopModel from "../../models/shop.model.js";
import CourseModel from "../../models/course.model.js";

import { getShopMapByIds } from "../shop/shop-query.helper.js";
import { mapShopListItem } from "../shop/shop.mapper.js";

// folders
/**
 * PickFolder 문서를 API 응답 형태로 변환
 */
function mapPickFolder(folder: {
  _id: Types.ObjectId;
  title: string;
  description?: string | null;
  order: number;
}): PickFolder {
  return {
    id: folder._id.toString(),
    title: folder.title,
    description: folder.description ?? null,
    order: folder.order,
  };
}

/**
 * 내가 만든 내 픽 폴더 목록을 조회
 */
export async function getMyPickFolders(
  userId: string,
): Promise<PickFolderListData> {
  const objectUserId = new Types.ObjectId(userId);

  const folders = await PickFolderModel.find({
    userId: objectUserId,
  })
    .sort({
      order: 1,
      createdAt: 1,
    })
    .lean();

  const folderIds = folders.map((folder) => folder._id);

  if (folderIds.length === 0) {
    return {
      items: [],
    };
  }

  const [counts, courses] = await Promise.all([
    PickFolderItemModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      {
        $match: {
          folderId: {
            $in: folderIds,
          },
        },
      },
      {
        $group: {
          _id: "$folderId",
          count: {
            $sum: 1,
          },
        },
      },
    ]),

    CourseModel.find({
      userId: objectUserId,
      courseType: "user_created",

      sourceFolderId: {
        $in: folderIds,
      },
    })
      .select({
        _id: 1,
        sourceFolderId: 1,
        regionGroup: 1,
      })
      .lean(),
  ]);

  const countByFolderId = new Map(
    counts.map(({ _id, count }) => [_id.toString(), count]),
  );

  const coursesByFolderId = new Map<
    string,
    Array<{
      courseId: string;
      regionGroup: ShopRegionGroup;
    }>
  >();

  for (const course of courses) {
    if (!course.sourceFolderId) {
      continue;
    }

    const folderId = course.sourceFolderId.toString();

    const folderCourses = coursesByFolderId.get(folderId) ?? [];

    folderCourses.push({
      courseId: course._id.toString(),

      regionGroup: course.regionGroup,
    });

    coursesByFolderId.set(folderId, folderCourses);
  }

  return {
    items: folders.map((folder) => {
      const folderId = folder._id.toString();

      return {
        ...mapPickFolder(folder),

        shopCount: countByFolderId.get(folderId) ?? 0,

        courses: coursesByFolderId.get(folderId) ?? [],
      };
    }),
  };
}

/**
 * 특정 내 픽 폴더에서 코스를 만들 수 있는
 * 지역별 상점 현황과 기존 코스를 조회합니다.
 */
export async function getPickFolderCourseRegions(
  userId: string,
  folderId: string,
): Promise<PickFolderCourseRegionsData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectFolderId = new Types.ObjectId(folderId);

  /**
   * 현재 사용자의 폴더인지 확인합니다.
   */
  const folder = await PickFolderModel.exists({
    _id: objectFolderId,
    userId: objectUserId,
  });

  if (!folder) {
    throw createApiError({
      status: 404,
      code: "PICK_FOLDER_NOT_FOUND",
      message: "내 픽 폴더를 찾을 수 없습니다.",
    });
  }

  /**
   * 폴더에 저장된 모든 상점 관계와
   * 이 폴더에서 만든 기존 지역별 코스를 함께 조회합니다.
   */
  const [folderItems, courses] = await Promise.all([
    PickFolderItemModel.find({
      folderId: objectFolderId,
    })
      .select({
        shopId: 1,
      })
      .lean(),

    CourseModel.find({
      userId: objectUserId,
      sourceFolderId: objectFolderId,
      courseType: "user_created",
    })
      .select({
        _id: 1,
        regionGroup: 1,
      })
      .lean(),
  ]);

  const shopIds = folderItems.map((item) => item.shopId);

  const shops =
    shopIds.length > 0
      ? await ShopModel.find({
          _id: {
            $in: shopIds,
          },
        })
          .select({
            _id: 1,
            regionGroup: 1,
            status: 1,
            location: 1,
          })
          .lean()
      : [];

  /**
   * 지역별 기존 코스를 빠르게 찾기 위한 Map
   */
  const courseIdByRegionGroup = new Map<ShopRegionGroup, string>();

  for (const course of courses) {
    courseIdByRegionGroup.set(course.regionGroup, course._id.toString());
  }

  type RegionSummary = {
    shopCount: number;
    availableShopCount: number;
    temporarilyClosedShopCount: number;
  };

  const regionSummaryMap = new Map<ShopRegionGroup, RegionSummary>();

  for (const shop of shops) {
    const regionGroup = shop.regionGroup;

    const current = regionSummaryMap.get(regionGroup) ?? {
      shopCount: 0,
      availableShopCount: 0,
      temporarilyClosedShopCount: 0,
    };

    current.shopCount += 1;

    const coordinates = shop.location?.coordinates;

    const hasLocation =
      Array.isArray(coordinates) &&
      coordinates.length >= 2 &&
      Number.isFinite(coordinates[0]) &&
      Number.isFinite(coordinates[1]);

    const isAvailableStatus =
      shop.status === "active" || shop.status === "temporarily_closed";

    if (hasLocation && isAvailableStatus) {
      current.availableShopCount += 1;

      if (shop.status === "temporarily_closed") {
        current.temporarilyClosedShopCount += 1;
      }
    }

    regionSummaryMap.set(regionGroup, current);
  }

  /**
   * 기존 코스는 있지만 현재 폴더에서
   * 신규 추가 가능한 상점이 없는 경우도 표시해야 합니다.
   */
  for (const course of courses) {
    if (!regionSummaryMap.has(course.regionGroup)) {
      regionSummaryMap.set(course.regionGroup, {
        shopCount: 0,
        availableShopCount: 0,
        temporarilyClosedShopCount: 0,
      });
    }
  }

  return {
    items: [...regionSummaryMap.entries()].map(([regionGroup, summary]) => ({
      regionGroup,

      shopCount: summary.shopCount,

      availableShopCount: summary.availableShopCount,

      temporarilyClosedShopCount: summary.temporarilyClosedShopCount,

      courseId: courseIdByRegionGroup.get(regionGroup) ?? null,
    })),
  };
}

/**
 * 새로운 내 픽 폴더를 생성
 * 새 폴더는 기존 폴더 목록의 마지막에 추가됨
 */
export async function createPickFolder(
  userId: string,
  input: CreatePickFolderRequest,
): Promise<PickFolder> {
  const objectUserId = new Types.ObjectId(userId);

  const lastFolder = await PickFolderModel.findOne({
    userId: objectUserId,
  })
    .sort({
      order: -1,
    })
    .select({
      order: 1,
    })
    .lean();

  const nextOrder = (lastFolder?.order ?? -1) + 1;

  const folder = await PickFolderModel.create({
    userId: objectUserId,
    title: input.title,
    description: input.description ?? null,
    order: nextOrder,
  });

  return mapPickFolder(folder);
}

/**
 * 내 픽 폴더 정보를 수정
 */
export async function updatePickFolder(
  userId: string,
  folderId: string,
  input: UpdatePickFolderRequest,
): Promise<PickFolder> {
  const objectUserId = new Types.ObjectId(userId);
  const folder = await PickFolderModel.findOneAndUpdate(
    {
      _id: folderId,
      userId: objectUserId,
    },
    {
      $set: input,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!folder) {
    throw createApiError({
      status: 404,
      code: "PICK_FOLDER_NOT_FOUND",
      message: "내 픽 폴더를 찾을 수 없습니다.",
    });
  }

  return mapPickFolder(folder);
}

/**
 * 내 픽 폴더와 폴더 안의 상점 관계를 삭제
 */
export async function deletePickFolder(
  userId: string,
  folderId: string,
): Promise<void> {
  const objectUserId = new Types.ObjectId(userId);

  const folder = await PickFolderModel.findOne({
    _id: folderId,
    userId: objectUserId,
  })
    .select({
      _id: 1,
    })
    .lean();

  if (!folder) {
    throw createApiError({
      status: 404,
      code: "PICK_FOLDER_NOT_FOUND",
      message: "내 픽 폴더를 찾을 수 없습니다.",
    });
  }
  await Promise.all([
    PickFolderModel.deleteOne({
      _id: folderId,
    }),

    PickFolderItemModel.deleteMany({
      folderId,
    }),

    // 폴더 삭제 시 Course는 삭제하지 않고 sourceFolderId만 null
    CourseModel.updateMany(
      {
        userId: objectUserId,
        sourceFolderId: folderId,
        courseType: "user_created",
      },
      {
        $set: {
          sourceFolderId: null,
        },
      },
    ),
  ]);
}

/**
 * 전달된 배열 순서대로 내 픽 폴더 order를 변경
 */
export async function updatePickFolderOrder(
  userId: string,
  input: UpdatePickFolderOrderRequest,
): Promise<void> {
  const objectUserId = new Types.ObjectId(userId);
  const { folderIds } = input;

  if (folderIds.length === 0) {
    return;
  }

  /**
   * 다른 사용자의 폴더 ID가 섞여 들어오는 것을 방지
   */
  const ownedFolders = await PickFolderModel.find({
    _id: {
      $in: folderIds,
    },
    userId: objectUserId,
  })
    .select({
      _id: 1,
    })
    .lean();

  if (ownedFolders.length !== folderIds.length) {
    throw createApiError({
      status: 400,
      code: "INVALID_PICK_FOLDER",
      message: "유효하지 않은 내 픽 폴더가 포함되어 있습니다.",
    });
  }

  await PickFolderModel.bulkWrite(
    folderIds.map((folderId, index) => ({
      updateOne: {
        filter: {
          _id: folderId,
          userId: objectUserId,
        },

        update: {
          $set: {
            order: index,
          },
        },
      },
    })),
  );
}

// shops
/**
 * 특정 상점이 현재 포함되어 있는 내 픽 폴더 ID 목록을 조회
 */
export async function getFolderIdsByShop(
  userId: string,
  shopId: string,
): Promise<ShopFolderIdsData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectShopId = new Types.ObjectId(shopId);

  const folders = await PickFolderModel.find({
    userId: objectUserId,
  })
    .select({
      _id: 1,
    })
    .lean();

  if (folders.length === 0) {
    return {
      folderIds: [],
    };
  }

  const folderIds = folders.map((folder) => folder._id);

  const items = await PickFolderItemModel.find({
    shopId: objectShopId,
    folderId: {
      $in: folderIds,
    },
  })
    .select({
      folderId: 1,
    })
    .lean();

  return {
    folderIds: items.map((item) => item.folderId.toString()),
  };
}

/**
 * 특정 상점의 폴더 소속을 요청받은 folderIds 상태로 맞춤
 */
export async function updateFolderIdsByShop(
  userId: string,
  shopId: string,
  input: UpdateShopFolderIdsRequest,
): Promise<ShopFolderIdsData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectShopId = new Types.ObjectId(shopId);

  /**
   * 중복된 folderId를 제거
   */
  const folderIds = [...new Set(input.folderIds)];

  const objectFolderIds = folderIds.map(
    (folderId) => new Types.ObjectId(folderId),
  );

  /**
   * 좋아요한 상점만 폴더에 저장할 수 있음
   */
  const isLiked = await ShopLikeModel.exists({
    userId: objectUserId,
    shopId: objectShopId,
  });

  if (!isLiked) {
    throw createApiError({
      status: 409,
      code: "SHOP_NOT_LIKED",
      message: "좋아요한 상점만 내 픽 폴더에 저장할 수 있습니다.",
    });
  }

  /**
   * 요청된 모든 폴더가 현재 사용자의 폴더인지 확인
   */
  const ownedFolders = await PickFolderModel.find({
    _id: {
      $in: objectFolderIds,
    },
    userId: objectUserId,
  })
    .select({
      _id: 1,
    })
    .lean();

  if (ownedFolders.length !== folderIds.length) {
    throw createApiError({
      status: 400,
      code: "INVALID_PICK_FOLDER",
      message: "유효하지 않은 내 픽 폴더가 포함되어 있습니다.",
    });
  }

  /**
   * 현재 사용자가 소유한 전체 폴더를 조회
   */
  const myFolders = await PickFolderModel.find({
    userId: objectUserId,
  })
    .select({
      _id: 1,
    })
    .lean();

  const myFolderIds = myFolders.map((folder) => folder._id);

  /**
   * 현재 상점이 들어가 있는 폴더 관계를 조회
   */
  const currentItems = await PickFolderItemModel.find({
    shopId: objectShopId,
    folderId: {
      $in: myFolderIds,
    },
  })
    .select({
      folderId: 1,
    })
    .lean();

  const currentFolderIds = new Set(
    currentItems.map((item) => item.folderId.toString()),
  );

  const nextFolderIds = new Set(folderIds);

  /**
   * 새로 추가할 폴더와 제거할 폴더를 계산
   */
  const folderIdsToAdd = folderIds.filter(
    (folderId) => !currentFolderIds.has(folderId),
  );

  const folderIdsToRemove = [...currentFolderIds].filter(
    (folderId) => !nextFolderIds.has(folderId),
  );

  /**
   * 해제된 폴더 관계를 삭제
   */
  if (folderIdsToRemove.length > 0) {
    await PickFolderItemModel.deleteMany({
      shopId: objectShopId,

      folderId: {
        $in: folderIdsToRemove.map((folderId) => new Types.ObjectId(folderId)),
      },
    });
  }

  /**
   * 새로 선택된 폴더에는 상점을 마지막 순서로 추가
   */
  for (const folderId of folderIdsToAdd) {
    const objectFolderId = new Types.ObjectId(folderId);

    await PickFolderItemModel.create({
      folderId: objectFolderId,
      shopId: objectShopId,
    });
  }

  return {
    folderIds,
  };
}

type GetShopsByFolderParams = Readonly<{
  userId: string;
  folderId: string;
  page: number;
  limit: number;

  regionGroup?: ShopRegionGroup;
  courseEligibleOnly?: boolean;
}>;

/**
 * 특정 내 픽 폴더에 저장된 상점 목록을 조회
 */
/**
 * 특정 내 픽 폴더에 저장된 상점 목록을 조회
 */
export async function getShopsByFolder({
  userId,
  folderId,
  page,
  limit,
  regionGroup,
  courseEligibleOnly,
}: GetShopsByFolderParams): Promise<PickFolderShopListData> {
  const objectFolderId = new Types.ObjectId(folderId);
  const objectUserId = new Types.ObjectId(userId);

  const folder = await PickFolderModel.exists({
    _id: objectFolderId,
    userId: objectUserId,
  });

  if (!folder) {
    throw createApiError({
      status: 404,
      code: "PICK_FOLDER_NOT_FOUND",
      message: "내 픽 폴더를 찾을 수 없습니다.",
    });
  }

  /**
   * 지역/코스 생성 조건이 있는 경우,
   * 먼저 해당 폴더에 포함된 상점 중 조건에 맞는 상점 ID를 찾습니다.
   */
  let filteredShopIds: Types.ObjectId[] | null = null;

  if (regionGroup || courseEligibleOnly) {
    const folderItems = await PickFolderItemModel.find({
      folderId: objectFolderId,
    })
      .select({
        shopId: 1,
      })
      .lean();

    const folderShopIds = folderItems.map((item) => item.shopId);

    if (folderShopIds.length === 0) {
      return {
        items: [],

        pagination: {
          totalCount: 0,
          page,
          limit,
          totalPages: 0,
          hasNext: false,
        },
      };
    }

    const shops = await ShopModel.find({
      _id: {
        $in: folderShopIds,
      },

      ...(regionGroup
        ? {
            regionGroup,
          }
        : {}),

      ...(courseEligibleOnly
        ? {
            status: {
              $in: ["active", "temporarily_closed"],
            },

            /**
             * 코스는 위치 좌표가 있는 상점만
             * 새로 추가할 수 있습니다.
             */
            "location.coordinates.0": {
              $type: "number",
            },

            "location.coordinates.1": {
              $type: "number",
            },
          }
        : {}),
    })
      .select({
        _id: 1,
      })
      .lean();

    filteredShopIds = shops.map((shop) => shop._id);

    if (filteredShopIds.length === 0) {
      return {
        items: [],

        pagination: {
          totalCount: 0,
          page,
          limit,
          totalPages: 0,
          hasNext: false,
        },
      };
    }
  }

  const skip = (page - 1) * limit;

  /**
   * 필터링된 상점 ID를 기준으로
   * 페이지네이션합니다.
   *
   * 일반 내 픽 조회에서는 filteredShopIds가 null이므로
   * 기존과 동일하게 폴더 전체 상점을 조회합니다.
   */
  const folderItemFilter = {
    folderId: objectFolderId,

    ...(filteredShopIds
      ? {
          shopId: {
            $in: filteredShopIds,
          },
        }
      : {}),
  };

  const [folderItems, totalCount] = await Promise.all([
    PickFolderItemModel.find(folderItemFilter)
      .sort({
        createdAt: 1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    PickFolderItemModel.countDocuments(folderItemFilter),
  ]);

  const shopIds = folderItems.map((item) => item.shopId);

  const shopMap = await getShopMapByIds(shopIds);

  const items = folderItems
    .map((item) => {
      const shop = shopMap.get(item.shopId.toString());

      if (!shop) {
        return null;
      }

      return mapShopListItem({
        shop,
        visitLogCount: 0,
        isLiked: true,
      });
    })
    .filter((shop) => shop !== null);

  const totalPages = Math.ceil(totalCount / limit);

  const hasNext = page < totalPages;

  return {
    items,

    pagination: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNext,
    },
  };
}
/**
 * 좋아요한 상점을 내 픽 폴더에 추가합니다.
 */
export async function addShopToFolder(
  userId: string,
  folderId: string,
  input: AddShopToFolderRequest,
): Promise<PickFolderShopData> {
  const objectUserId = new Types.ObjectId(userId);
  const objectFolderId = new Types.ObjectId(folderId);
  const objectShopId = new Types.ObjectId(input.shopId);

  /**
   * 폴더 존재 여부를 먼저 확인합니다.
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
   * 다른 사용자의 폴더에는 상점을 추가할 수 없습니다.
   */
  if (folder.userId.toString() !== objectUserId.toString()) {
    throw createApiError({
      status: 403,
      code: "PICK_FOLDER_FORBIDDEN",
      message: "다른 사용자의 내 픽 폴더에는 접근할 수 없습니다.",
    });
  }

  /**
   * 실제 존재하는 상점인지 확인합니다.
   */
  const shopExists = await ShopModel.exists({
    _id: objectShopId,
  });

  if (!shopExists) {
    throw createApiError({
      status: 404,
      code: "SHOP_NOT_FOUND",
      message: "상점을 찾을 수 없습니다.",
    });
  }

  /**
   * 현재 사용자가 좋아요한 상점인지 확인합니다.
   */
  const isLiked = await ShopLikeModel.exists({
    userId: objectUserId,
    shopId: objectShopId,
  });

  if (!isLiked) {
    throw createApiError({
      status: 409,
      code: "SHOP_NOT_LIKED",
      message: "좋아요한 상점만 내 픽 폴더에 저장할 수 있습니다.",
    });
  }

  /**
   * 동일한 폴더에 같은 상점이 이미 들어있는지 확인합니다.
   */
  const existingItem = await PickFolderItemModel.exists({
    folderId: objectFolderId,
    shopId: objectShopId,
  });

  if (existingItem) {
    throw createApiError({
      status: 409,
      code: "SHOP_ALREADY_IN_FOLDER",
      message: "이미 해당 내 픽 폴더에 추가된 상점입니다.",
    });
  }

  await PickFolderItemModel.create({
    folderId: objectFolderId,
    shopId: objectShopId,
  });

  return {
    folderId,
    shopId: input.shopId,
  };
}

/**
 * 내 픽 폴더에서 상점을 제거합니다.
 *
 * 폴더에서만 제거하며 ShopLike는 유지합니다.
 */
export async function removeShopFromFolder(
  userId: string,
  folderId: string,
  shopId: string,
): Promise<void> {
  const objectUserId = new Types.ObjectId(userId);
  const objectFolderId = new Types.ObjectId(folderId);
  const objectShopId = new Types.ObjectId(shopId);

  /**
   * 폴더 존재 여부를 먼저 확인합니다.
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
   * 다른 사용자의 폴더에는 접근할 수 없습니다.
   */
  if (folder.userId.toString() !== objectUserId.toString()) {
    throw createApiError({
      status: 403,
      code: "PICK_FOLDER_FORBIDDEN",
      message: "다른 사용자의 내 픽 폴더에는 접근할 수 없습니다.",
    });
  }
  /**
   * 실제 존재하는 상점인지 확인합니다.
   */
  const shopExists = await ShopModel.exists({
    _id: objectShopId,
  });

  if (!shopExists) {
    throw createApiError({
      status: 404,
      code: "SHOP_NOT_FOUND",
      message: "상점을 찾을 수 없습니다.",
    });
  }

  /**
   * 해당 폴더에 상점이 실제로 들어있는지 확인합니다.
   */
  const item = await PickFolderItemModel.exists({
    folderId: objectFolderId,
    shopId: objectShopId,
  });

  if (!item) {
    throw createApiError({
      status: 404,
      code: "FOLDER_SHOP_NOT_FOUND",
      message: "해당 내 픽 폴더에 저장된 상점을 찾을 수 없습니다.",
    });
  }

  await PickFolderItemModel.deleteOne({
    folderId: objectFolderId,
    shopId: objectShopId,
  });

  /**
   * ShopLikeModel은 삭제하지 않습니다.
   */
}
