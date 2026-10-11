import { describe, expect, it } from "vitest";

import type {
  CourseDetailData,
  CourseLikeData,
  LikedCourseListData,
  MyCourseListData,
} from "@sopum-map/shared";
import type { InfiniteData } from "@tanstack/react-query";

import {
  getNextCourseCursor,
  removeLikedCourseFromPages,
  updateCourseDetailLike,
  updateCourseDetailVisibility,
  updateMyCourseVisibilityInPages,
} from "./course.query";

const detail: CourseDetailData = {
  id: "course-1",
  courseType: "user_created",
  sourceFolderId: "folder-1",
  title: "성수 소품 산책",
  description: null,
  regionGroup: "seongsu-seoulforest",
  isPublic: true,
  author: {
    id: "user-1",
    displayName: "만든 사람",
    profileImageUrl: null,
    isService: false,
  },
  isOwner: false,
  likeCount: 2,
  isLiked: false,
  shops: [],
  createdAt: "2026-10-12T00:00:00.000Z",
  updatedAt: "2026-10-12T00:00:00.000Z",
};

const likeResult: CourseLikeData = {
  courseId: "course-1",
  isLiked: true,
  likeCount: 3,
};

/** 한 페이지뿐인 무한 목록 테스트 데이터를 만듭니다. */
function createInfiniteData<T>(page: T): InfiniteData<T, string | undefined> {
  return {
    pages: [page],
    pageParams: [undefined],
  };
}

describe("course query cache helpers", () => {
  it("좋아요 결과를 상세 캐시에 즉시 반영한다", () => {
    expect(updateCourseDetailLike(detail, likeResult)).toMatchObject({
      isLiked: true,
      likeCount: 3,
    });
  });

  it("공개·비공개 찜 항목을 모두 목록에서 제거한다", () => {
    const data = createInfiniteData<LikedCourseListData>({
      items: [
        {
          id: "course-1",
          isPrivate: false,
          title: "성수 소품 산책",
          description: null,
          regionGroup: "seongsu-seoulforest",
          shopCount: 2,
          mainImageUrl: null,
          author: detail.author,
          likeCount: 3,
          likedAt: "2026-10-12T01:00:00.000Z",
        },
        {
          id: "course-2",
          isPrivate: true,
          likedAt: "2026-10-12T00:00:00.000Z",
        },
      ],
      hasNext: false,
      nextCursor: null,
    });

    expect(removeLikedCourseFromPages(data, "course-1")?.pages[0].items).toEqual([
      expect.objectContaining({ id: "course-2", isPrivate: true }),
    ]);
    expect(removeLikedCourseFromPages(data, "course-2")?.pages[0].items).toEqual([
      expect.objectContaining({ id: "course-1", isPrivate: false }),
    ]);
  });

  it("공개 상태를 상세과 내 코스 목록에 함께 반영한다", () => {
    const data = createInfiniteData<MyCourseListData>({
      items: [
        {
          id: "course-1",
          title: "성수 소품 산책",
          description: null,
          regionGroup: "seongsu-seoulforest",
          sourceFolderId: "folder-1",
          shopCount: 2,
          mainImageUrl: null,
          isPublic: true,
          likeCount: 2,
          createdAt: "2026-10-12T00:00:00.000Z",
          updatedAt: "2026-10-12T00:00:00.000Z",
        },
      ],
      hasNext: false,
      nextCursor: null,
    });

    expect(updateCourseDetailVisibility(detail, false)?.isPublic).toBe(false);
    expect(
      updateMyCourseVisibilityInPages(data, "course-1", false)?.pages[0]
        .items[0].isPublic,
    ).toBe(false);
  });

  it("다음 페이지 매개변수로 nextCursor를 사용한다", () => {
    expect(
      getNextCourseCursor({ items: [], hasNext: true, nextCursor: "cursor-2" }),
    ).toBe("cursor-2");
    expect(
      getNextCourseCursor({ items: [], hasNext: false, nextCursor: null }),
    ).toBeUndefined();
  });

  it("낙관적 변경 전 값을 보존하면 실패 시 그대로 복구할 수 있다", () => {
    const previousDetail = detail;
    const optimisticDetail = updateCourseDetailLike(detail, likeResult);

    expect(optimisticDetail).not.toBe(previousDetail);
    expect(previousDetail).toMatchObject({ isLiked: false, likeCount: 2 });
  });
});
