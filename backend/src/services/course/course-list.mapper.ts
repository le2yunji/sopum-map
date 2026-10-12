import { Types } from "mongoose";

import type {
  CourseAuthor,
  CourseCursorPage,
  CourseType,
  LikedCourseListItem,
  MyCourseListItem,
  ShopRegionGroup,
} from "@sopum-map/shared";

import { encodeCourseCursor } from "./course-cursor.js";

type CursorDocument = Readonly<{
  _id: Types.ObjectId;
  createdAt: Date;
}>;

type CourseListDocument = CursorDocument &
  Readonly<{
    courseType: CourseType;
    userId?: Types.ObjectId | null;
    sourceFolderId?: Types.ObjectId | null;
    title: string;
    description?: string | null;
    regionGroup: ShopRegionGroup;
    isPublic: boolean;
    shops: readonly Readonly<{
      shopId: Types.ObjectId;
      order: number;
    }>[];
    updatedAt: Date;
  }>;

/** limit보다 한 건 더 조회한 결과로 항목과 다음 커서를 만듭니다. */
export function createCourseCursorPage<TDocument extends CursorDocument, TItem>(
  documents: readonly TDocument[],
  limit: number,
  mapItem: (document: TDocument) => TItem,
): CourseCursorPage<TItem> {
  const visibleDocuments = documents.slice(0, limit);
  const lastDocument = visibleDocuments.at(-1);
  const hasNext = documents.length > limit;

  return {
    items: visibleDocuments.map(mapItem),
    hasNext,
    nextCursor:
      hasNext && lastDocument
        ? encodeCourseCursor({
            createdAt: lastDocument.createdAt,
            id: lastDocument._id,
          })
        : null,
  };
}

/** 내 코스 문서를 목록 카드가 사용하는 표시 데이터로 바꿉니다. */
export function mapMyCourseListItem(
  course: CourseListDocument,
  display: Readonly<{
    mainImageUrl: string | null;
    likeCount: number;
  }>,
): MyCourseListItem {
  return {
    id: course._id.toString(),
    title: course.title,
    description: course.description ?? null,
    regionGroup: course.regionGroup,
    sourceFolderId: course.sourceFolderId?.toString() ?? null,
    shopCount: course.shops.length,
    mainImageUrl: display.mainImageUrl,
    isPublic: course.isPublic,
    likeCount: display.likeCount,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

/** 찜한 코스는 비공개 여부에 따라 노출 가능한 정보만 골라 반환합니다. */
export function mapLikedCourseListItem({
  course,
  likedAt,
  mainImageUrl,
  likeCount,
  author,
}: Readonly<{
  course: CourseListDocument;
  likedAt: Date;
  mainImageUrl: string | null;
  likeCount: number;
  author: CourseAuthor;
}>): LikedCourseListItem {
  const isPrivate =
    course.courseType === "user_created" && !course.isPublic;

  if (isPrivate) {
    return {
      id: course._id.toString(),
      isPrivate: true,
      likedAt: likedAt.toISOString(),
    };
  }

  return {
    id: course._id.toString(),
    isPrivate: false,
    title: course.title,
    description: course.description ?? null,
    regionGroup: course.regionGroup,
    shopCount: course.shops.length,
    mainImageUrl,
    author,
    likeCount,
    likedAt: likedAt.toISOString(),
  };
}

/** 코스 종류와 사용자 문서로 목록에 표시할 작성자 정보를 만듭니다. */
export function createCourseListAuthor(
  course: Pick<CourseListDocument, "courseType" | "userId">,
  user: Readonly<{
    _id: Types.ObjectId;
    nickname?: string | null;
    profileImage?: string | null;
  }> | null,
): CourseAuthor {
  if (course.courseType === "recommended") {
    return {
      id: null,
      displayName: "소품지도",
      profileImageUrl: null,
      isService: true,
    };
  }

  return {
    id: course.userId?.toString() ?? null,
    displayName: user?.nickname ?? "알 수 없는 사용자",
    profileImageUrl: user?.profileImage ?? null,
    isService: false,
  };
}
