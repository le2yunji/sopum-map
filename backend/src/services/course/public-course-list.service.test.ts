import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findCourses: vi.fn(),
  loadItems: vi.fn(),
  sort: vi.fn(),
  limit: vi.fn(),
}));

vi.mock("../../models/course.model.js", () => ({
  default: { find: modelMocks.findCourses },
}));
vi.mock("./public-course-display.service.js", () => ({
  loadPublicCourseListItems: modelMocks.loadItems,
}));

import { getPublicCourseList } from "./public-course-list.service.js";

const courses = [
  {
    _id: new Types.ObjectId("6a8a68e15e2aa43be6a6549d"),
    createdAt: new Date("2026-11-02T00:00:00.000Z"),
    likeCount: 8,
  },
  {
    _id: new Types.ObjectId("6a8a68e15e2aa43be6a6549e"),
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
    likeCount: 7,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.limit.mockReturnValue({
    lean: vi.fn().mockResolvedValue(courses),
  });
  modelMocks.sort.mockReturnValue({ limit: modelMocks.limit });
  modelMocks.findCourses.mockReturnValue({ sort: modelMocks.sort });
  modelMocks.loadItems.mockImplementation(
    async (visibleCourses: typeof courses) =>
      visibleCourses.map((course) => ({ id: course._id.toString() })),
  );
});

describe("getPublicCourseList", () => {
  it("공개 코스와 지역을 걸러 최신순으로 limit + 1개 조회한다", async () => {
    await getPublicCourseList({
      regionGroup: "mangwon",
      sort: "latest",
      limit: 1,
    });

    expect(modelMocks.findCourses).toHaveBeenCalledWith({
      isPublic: true,
      regionGroup: "mangwon",
    });
    expect(modelMocks.sort).toHaveBeenCalledWith({ createdAt: -1, _id: -1 });
    expect(modelMocks.limit).toHaveBeenCalledWith(2);
  });

  it("인기순은 좋아요 수와 생성 시각과 ID 순서로 조회한다", async () => {
    const result = await getPublicCourseList({ sort: "popular", limit: 1 });

    expect(modelMocks.sort).toHaveBeenCalledWith({
      likeCount: -1,
      createdAt: -1,
      _id: -1,
    });
    expect(result).toMatchObject({ hasNext: true });
    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toEqual(expect.any(String));
  });
});
