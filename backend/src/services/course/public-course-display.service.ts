import { Types } from "mongoose";

import type { PublicCourseListItem } from "@sopum-map/shared";

import ShopModel from "../../models/shop.model.js";
import UserModel from "../../models/user.model.js";
import {
  mapPublicCourseListItem,
  type PublicCourseAuthorDocument,
  type PublicCourseDocument,
  type PublicCourseShopDocument,
} from "./public-course-list.mapper.js";

/** 같은 ObjectId를 문자열 기준으로 한 번만 남깁니다. */
function getUniqueObjectIds(
  ids: readonly Types.ObjectId[],
): readonly Types.ObjectId[] {
  const idByString = new Map(ids.map((id) => [id.toString(), id]));

  return [...idByString.values()];
}

/** 공개 코스 목록에 필요한 작성자와 상점을 묶음 조회해 카드 데이터를 만듭니다. */
export async function loadPublicCourseListItems(
  courses: readonly PublicCourseDocument[],
): Promise<readonly PublicCourseListItem[]> {
  if (courses.length === 0) {
    return [];
  }

  const userIds = getUniqueObjectIds(
    courses.flatMap((course) => (course.userId ? [course.userId] : [])),
  );

  const shopIds = getUniqueObjectIds(
    courses.flatMap((course) => course.shops.map((shop) => shop.shopId)),
  );

  const [users, shops] = await Promise.all([
    UserModel.find({
      _id: {
        $in: userIds,
      },
    })
      .select({
        _id: 1,
        nickname: 1,
        profileImage: 1,
      })
      .lean(),

    ShopModel.find({
      _id: {
        $in: shopIds,
      },
    })
      .select({
        _id: 1,
        images: 1,
        tagStats: 1,
      })
      .lean(),
  ]);

  const userById = new Map<string, PublicCourseAuthorDocument>(
    users.map((user) => [user._id.toString(), user]),
  );

  const shopById = new Map<string, PublicCourseShopDocument>(
    shops.map((shop) => [shop._id.toString(), shop]),
  );

  return courses.map((course) => {
    const authorUser = course.userId
      ? (userById.get(course.userId.toString()) ?? null)
      : null;

    return mapPublicCourseListItem(course, authorUser, shopById);
  });
}
