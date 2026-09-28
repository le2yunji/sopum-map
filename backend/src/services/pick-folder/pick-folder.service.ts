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
} from "@sopum-map/shared";

import PickFolderModel from "../../models/pick-folder.model.js";
import PickFolderItemModel from "../../models/pick-folder-item.model.js";
import ShopLikeModel from "../../models/shop-like.model.js";
import { getShopMapByIds } from "../shop/shop-query.helper.js";
import ShopModel from "../../models/shop.model.js";
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

  /**
   * 각 폴더의 상점 수를 한 번에 집계
   */
  const counts =
    folderIds.length > 0
      ? await PickFolderItemModel.aggregate<{
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
        ])
      : [];

  const countByFolderId = new Map(
    counts.map(({ _id, count }) => [_id.toString(), count]),
  );

  return {
    items: folders.map((folder) => ({
      ...mapPickFolder(folder),
      shopCount: countByFolderId.get(folder._id.toString()) ?? 0,
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
}>;

/**
 * 특정 내 픽 폴더에 저장된 상점 목록을 조회
 */
export async function getShopsByFolder({
  userId,
  folderId,
  page,
  limit,
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

  const skip = (page - 1) * limit;

  const [folderItems, totalCount] = await Promise.all([
    PickFolderItemModel.find({
      folderId: objectFolderId,
    })
      .sort({
        createdAt: 1,
      })
      .skip(skip)
      .limit(limit),

    PickFolderItemModel.countDocuments({
      folderId: objectFolderId,
    }),
  ]);

  const shopIds = folderItems.map((item) => item.shopId);

  const shopMap = await getShopMapByIds(shopIds);

  const items = folderItems
    .map((item) => {
      const shop = shopMap.get(item.shopId.toString());

      if (!shop) {
        return null;
      }

      const mainImage =
        shop.images
          ?.filter((image) => image.isMain)
          .sort((a, b) => a.order - b.order)[0] ??
        shop.images?.sort((a, b) => a.order - b.order)[0] ??
        null;

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
