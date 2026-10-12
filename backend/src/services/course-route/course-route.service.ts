import { Types } from "mongoose";

import {
  createApiError,
  type OptimizeCourseRouteData,
  type OptimizeCourseRouteRequest,
} from "@sopum-map/shared";

import PickFolderItemModel from "../../models/pick-folder-item.model.js";
import PickFolderModel from "../../models/pick-folder.model.js";
import ShopModel from "../../models/shop.model.js";

import { optimizeCourseRoute } from "./course-route-optimizer.service.js";
import { getWalkingDistanceMatrix } from "./walking-distance-matrix.service.js";

type OptimizeUserCourseRouteParams = Readonly<{
  userId: string;
  input: OptimizeCourseRouteRequest;
}>;

/**
 * 선택된 상점들의 실제 도보 거리를 기준으로
 * 추천 방문 순서를 계산합니다.
 */
export async function optimizeUserCourseRoute({
  userId,
  input,
}: OptimizeUserCourseRouteParams): Promise<OptimizeCourseRouteData> {
  const { sourceFolderId, regionGroup, shopIds } = input;

  const objectUserId = new Types.ObjectId(userId);

  const objectFolderId = new Types.ObjectId(sourceFolderId);

  const objectShopIds = shopIds.map((shopId) => new Types.ObjectId(shopId));

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
   * 요청된 모든 상점이 실제로
   * 해당 폴더에 포함되어 있는지 확인합니다.
   */
  const folderItems = await PickFolderItemModel.find({
    folderId: objectFolderId,

    shopId: {
      $in: objectShopIds,
    },
  })
    .select({
      shopId: 1,
    })
    .lean();

  if (folderItems.length !== shopIds.length) {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_SHOPS",
      message: "해당 내 픽 폴더에 포함되지 않은 상점이 있습니다.",
    });
  }

  /**
   * 선택된 상점의 지역, 상태, 위치 정보를 확인합니다.
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

  if (shops.length !== shopIds.length) {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_SHOPS",
      message: "유효하지 않은 상점이 포함되어 있습니다.",
    });
  }

  const shopById = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  /**
   * 요청된 shopIds 순서를 유지하면서
   * TMAP 입력 좌표를 구성합니다.
   */
  const routePoints = shopIds.map((shopId) => {
    const shop = shopById.get(shopId);

    if (!shop) {
      throw createApiError({
        status: 400,
        code: "INVALID_COURSE_SHOPS",
        message: "유효하지 않은 상점이 포함되어 있습니다.",
      });
    }

    if (shop.regionGroup !== regionGroup) {
      throw createApiError({
        status: 400,
        code: "COURSE_REGION_MISMATCH",
        message: "같은 지역의 상점만 하나의 코스에 포함할 수 있습니다.",
      });
    }

    if (shop.status !== "active" && shop.status !== "temporarily_closed") {
      throw createApiError({
        status: 400,
        code: "COURSE_SHOP_UNAVAILABLE",
        message: "현재 코스에 추가할 수 없는 상점이 포함되어 있습니다.",
      });
    }

    const coordinates = shop.location?.coordinates;

    if (
      !coordinates ||
      coordinates.length < 2 ||
      !Number.isFinite(coordinates[0]) ||
      !Number.isFinite(coordinates[1])
    ) {
      throw createApiError({
        status: 400,
        code: "INVALID_SHOP_LOCATION",
        message: "위치 정보가 없는 상점은 코스에 추가할 수 없습니다.",
      });
    }

    return {
      shopId,

      longitude: coordinates[0],

      latitude: coordinates[1],
    };
  });

  const distanceMatrix = await getWalkingDistanceMatrix(routePoints);

  const { orderedIndexes, totalDistanceMeters } =
    optimizeCourseRoute(distanceMatrix);

  return {
    shopIds: orderedIndexes.map((index) => routePoints[index].shopId),

    totalDistanceMeters,
  };
}
