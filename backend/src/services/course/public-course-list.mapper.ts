import { Types } from "mongoose";

import {
  TAG_DEFINITIONS,
  type CourseType,
  type PublicCourseListItem,
  type ShopRegionGroup,
  type TagKey,
} from "@sopum-map/shared";

import { getMainShopImageUrl } from "../../utils/shop-image.js";
import { createCourseListAuthor } from "./course-list.mapper.js";

export type PublicCourseDocument = Readonly<{
  _id: Types.ObjectId;
  courseType: CourseType;
  userId?: Types.ObjectId | null;
  title: string;
  description?: string | null;
  regionGroup: ShopRegionGroup;
  isPublic: boolean;
  likeCount?: number;
  isOfficialPick?: boolean;
  shops: readonly Readonly<{
    shopId: Types.ObjectId;
    order: number;
  }>[];
  createdAt: Date;
}>;

export type PublicCourseAuthorDocument = Readonly<{
  _id: Types.ObjectId;
  nickname?: string | null;
  profileImage?: string | null;
}>;

export type PublicCourseShopDocument = Readonly<{
  _id: Types.ObjectId;
  images?: readonly Readonly<{
    imageUrl: string;
    isMain?: boolean | null;
    order?: number | null;
  }>[];
  tagStats?: readonly Readonly<{
    key: TagKey;
    count: number;
  }>[];
}>;

export type ShopTagSource = Pick<PublicCourseShopDocument, "tagStats">;

/** 여러 상점에 많이 등장한 태그를 공용 태그 순서에 따라 최대 2개 선택합니다. */
export function selectRepresentativeTagKeys(
  shops: readonly ShopTagSource[],
): readonly TagKey[] {
  const occurrenceByKey = new Map<TagKey, number>();

  for (const shop of shops) {
    const uniqueKeys = new Set((shop.tagStats ?? []).map((tag) => tag.key));

    for (const key of uniqueKeys) {
      occurrenceByKey.set(key, (occurrenceByKey.get(key) ?? 0) + 1);
    }
  }

  return TAG_DEFINITIONS.map((definition, order) => ({
    key: definition.key,
    occurrence: occurrenceByKey.get(definition.key) ?? 0,
    order,
  }))
    .filter((tag) => tag.occurrence > 0)
    .sort(
      (first, second) =>
        second.occurrence - first.occurrence || first.order - second.order,
    )
    .slice(0, 2)
    .map((tag) => tag.key);
}

/** 공개 코스 문서와 표시용 사용자·상점 데이터를 목록 응답 항목으로 변환합니다. */
export function mapPublicCourseListItem(
  course: PublicCourseDocument,
  authorUser: PublicCourseAuthorDocument | null,
  shopById: ReadonlyMap<string, PublicCourseShopDocument>,
): PublicCourseListItem {
  const orderedShops = [...course.shops]
    .sort((first, second) => first.order - second.order)
    .map((courseShop) => shopById.get(courseShop.shopId.toString()))
    .filter((shop): shop is PublicCourseShopDocument => shop !== undefined);

  const imageUrls = orderedShops
    .map((shop) => getMainShopImageUrl(shop.images ?? []))
    .filter((imageUrl): imageUrl is string => imageUrl !== null)
    .slice(0, 4);

  const isOfficialPick =
    course.courseType === "user_created" &&
    course.isPublic &&
    course.isOfficialPick === true;

  return {
    id: course._id.toString(),
    courseType: course.courseType,
    title: course.title,
    description: course.description ?? null,
    regionGroup: course.regionGroup,
    imageUrls,
    representativeTagKeys: selectRepresentativeTagKeys(orderedShops),
    author: createCourseListAuthor(course, authorUser),
    likeCount: course.likeCount ?? 0,
    isOfficialPick,
    createdAt: course.createdAt.toISOString(),
  };
}
