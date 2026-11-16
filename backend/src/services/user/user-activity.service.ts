import type { MyActivitySummaryData } from "@sopum-map/shared";
import { Types } from "mongoose";

import CourseModel from "../../models/course.model.js";
import VisitLogModel from "../../models/visit-log.model.js";
import { countMyVisitedShops } from "./user-visited-shop.service.js";

/** 로그인 사용자의 마이페이지 활동 집계를 조회합니다. */
export async function getMyActivitySummary(
  userId: string,
): Promise<MyActivitySummaryData> {
  const objectUserId = new Types.ObjectId(userId);

  const [createdCourseCount, visitLogCount, visitedShopCount] =
    await Promise.all([
      CourseModel.countDocuments({
        userId: objectUserId,
        courseType: "user_created",
      }),

      VisitLogModel.countDocuments({
        userId: objectUserId,
        status: "active",
      }),

      countMyVisitedShops(userId),
    ]);

  return {
    createdCourseCount,
    visitLogCount,
    visitedShopCount,
  };
}
