// backend/src/services/visit-log/visit-log.service.ts

import { createApiError } from "@sopum-map/shared";

import ShopModel from "../../models/shop.model.js";
import UserModel from "../../models/user.model.js";
import VisitLogModel from "../../models/visit-log.model.js";

import { mapVisitLogListItem } from "./visit-log.mapper.js";

import type {
  GetVisitLogsServiceParams,
  GetVisitLogsServiceResult,
} from "./visit-log.service.types.js";

export async function getVisitLogs(
  params: GetVisitLogsServiceParams,
): Promise<GetVisitLogsServiceResult> {
  const { shopId, page, limit } = params;

  const shopExists = await ShopModel.exists({
    _id: shopId,
    status: "active",
  });

  if (!shopExists) {
    throw createApiError({
      status: 404,
      code: "SHOP_NOT_FOUND",
      message: "상점을 찾을 수 없습니다.",
    });
  }

  const skip = (page - 1) * limit;

  const [visitLogs, totalCount] = await Promise.all([
    VisitLogModel.find({
      shopId,
    })
      .sort({
        visitedAt: -1,
        _id: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    VisitLogModel.countDocuments({
      shopId,
    }),
  ]);

  const userIds = [
    ...new Set(visitLogs.map((visitLog) => visitLog.userId.toString())),
  ];

  const users = await UserModel.find({
    _id: {
      $in: userIds,
    },
  })
    .select({
      nickname: 1,
      profileImage: 1,
      isDeleted: 1,
    })
    .lean();

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  const items = visitLogs.map((visitLog) => {
    const user = userMap.get(visitLog.userId.toString());

    const author =
      !user || user.isDeleted
        ? {
            id: visitLog.userId.toString(),
            nickname: "알 수 없는 사용자",
            profileImage: null,
            isMe: false,
          }
        : {
            id: user._id.toString(),
            nickname: user.nickname ?? "알 수 없는 사용자",
            profileImage: user.profileImage ?? null,
            isMe: false,
          };

    return mapVisitLogListItem({
      visitLog,
      author,
    });
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    items,

    pagination: {
      totalCount,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
    },
  };
}
