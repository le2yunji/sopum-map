import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
}));

vi.mock("../client", () => ({
  apiClient: apiMocks.apiClient,
}));

import {
  getHomeCourseRecommendations,
  getPublicCourses,
} from "./course.api";

beforeEach(() => {
  vi.clearAllMocks();
  apiMocks.apiClient.mockResolvedValue({
    items: [],
    hasNext: false,
    nextCursor: null,
  });
});

describe("공개 코스 API", () => {
  it("기본 조건으로 공개 코스 첫 페이지를 조회한다", async () => {
    await getPublicCourses({});

    expect(apiMocks.apiClient).toHaveBeenCalledWith(
      "/courses?sort=latest&limit=20",
    );
  });

  it("지역·정렬·커서·개수를 모두 query string에 넣는다", async () => {
    await getPublicCourses({
      regionGroup: "mangwon",
      sort: "popular",
      cursor: "next-cursor",
      limit: 10,
    });

    const [requestPath] = apiMocks.apiClient.mock.calls[0] as [string];
    const [pathname, queryString] = requestPath.split("?");
    const searchParams = new URLSearchParams(queryString);

    expect(pathname).toBe("/courses");
    expect(searchParams.get("regionGroup")).toBe("mangwon");
    expect(searchParams.get("sort")).toBe("popular");
    expect(searchParams.get("cursor")).toBe("next-cursor");
    expect(searchParams.get("limit")).toBe("10");
  });

  it("홈 추천 전용 경로를 조회한다", async () => {
    await getHomeCourseRecommendations();

    expect(apiMocks.apiClient).toHaveBeenCalledWith("/courses/home");
  });
});
