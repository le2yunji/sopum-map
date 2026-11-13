import {
  DEFAULT_COURSE_LIST_LIMIT,
  type GetPublicCoursesQuery,
  type PublicCourseListData,
  type PublicCourseSort,
} from "@sopum-map/shared";

import CourseModel from "../../models/course.model.js";
import {
  decodePublicCourseCursor,
  encodePublicCourseCursor,
} from "./public-course-cursor.js";
import { loadPublicCourseListItems } from "./public-course-display.service.js";
import type { PublicCourseDocument } from "./public-course-list.mapper.js";

const LATEST_COURSE_SORT = {
  createdAt: -1,
  _id: -1,
} as const;

const POPULAR_COURSE_SORT = {
  likeCount: -1,
  createdAt: -1,
  _id: -1,
} as const;

/** 커서가 있으면 마지막으로 본 코스보다 뒤에 있는 범위를 만듭니다. */
function createPublicCourseCursorFilter(
  cursor: string | undefined,
  sort: PublicCourseSort,
) {
  if (!cursor) {
    return {};
  }

  const decoded = decodePublicCourseCursor(cursor, sort);

  if (decoded.sort === "popular") {
    return {
      $or: [
        {
          likeCount: {
            $lt: decoded.likeCount,
          },
        },
        {
          likeCount: decoded.likeCount,
          createdAt: {
            $lt: decoded.createdAt,
          },
        },
        {
          likeCount: decoded.likeCount,
          createdAt: decoded.createdAt,
          _id: {
            $lt: decoded.id,
          },
        },
      ],
    };
  }

  return {
    $or: [
      {
        createdAt: {
          $lt: decoded.createdAt,
        },
      },
      {
        createdAt: decoded.createdAt,
        _id: {
          $lt: decoded.id,
        },
      },
    ],
  };
}

/** 마지막으로 노출한 코스의 정렬 위치를 다음 요청용 커서로 만듭니다. */
function createNextPublicCourseCursor(
  course: Pick<PublicCourseDocument, "_id" | "createdAt" | "likeCount">,
  sort: PublicCourseSort,
): string {
  if (sort === "popular") {
    return encodePublicCourseCursor({
      sort: "popular",
      likeCount: course.likeCount ?? 0,
      createdAt: course.createdAt,
      id: course._id,
    });
  }

  return encodePublicCourseCursor({
    sort: "latest",
    createdAt: course.createdAt,
    id: course._id,
  });
}

/** 공개 코스를 지역과 정렬 조건에 따라 커서 기반으로 조회합니다. */
export async function getPublicCourseList(
  query: GetPublicCoursesQuery,
): Promise<PublicCourseListData> {
  const {
    regionGroup,
    cursor,
    sort = "latest",
    limit = DEFAULT_COURSE_LIST_LIMIT,
  } = query;

  const filter = {
    isPublic: true,

    ...(regionGroup
      ? {
          regionGroup,
        }
      : {}),

    ...createPublicCourseCursorFilter(cursor, sort),
  };

  const sortOrder =
    sort === "popular" ? POPULAR_COURSE_SORT : LATEST_COURSE_SORT;

  const courses = await CourseModel.find(filter)
    .sort(sortOrder)
    .limit(limit + 1)
    .lean();

  const hasNext = courses.length > limit;
  const visibleCourses = courses.slice(0, limit);
  const lastCourse = visibleCourses.at(-1);

  const items = await loadPublicCourseListItems(visibleCourses);

  return {
    items,
    hasNext,
    nextCursor:
      hasNext && lastCourse
        ? createNextPublicCourseCursor(lastCourse, sort)
        : null,
  };
}
