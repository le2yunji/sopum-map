import type { MyActivitySummaryData } from "@sopum-map/shared";
import { Types } from "mongoose";

import CourseModel from "../../models/course.model.js";
import CourseShopVisitModel from "../../models/course-shop-visit.model.js";
import VisitLogModel from "../../models/visit-log.model.js";

/** 로그인 사용자의 마이페이지 활동 집계를 조회합니다. */
export async function getMyActivitySummary(
  userId: string,
): Promise<MyActivitySummaryData> {
  const objectUserId = new Types.ObjectId(userId);

  const activeVisitLogFilter = {
    userId: objectUserId,
    status: "active" as const,
  };

  const [
    createdCourseCount,
    visitLogCount,
    visitLogShopIds,
    courseVisitShopIds,
  ] = await Promise.all([
    CourseModel.countDocuments({
      userId: objectUserId,
      courseType: "user_created",
    }),

    VisitLogModel.countDocuments(activeVisitLogFilter),

    VisitLogModel.distinct("shopId", activeVisitLogFilter),

    CourseShopVisitModel.distinct("shopId", {
      userId: objectUserId,
    }),
  ]);

  const visitedShopIds = new Set(
    [...visitLogShopIds, ...courseVisitShopIds].map((shopId) =>
      shopId.toString(),
    ),
  );

  return {
    createdCourseCount,
    visitLogCount,
    visitedShopCount: visitedShopIds.size,
  };
}
