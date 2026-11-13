import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";

const modelMocks = vi.hoisted(() => ({
  findCourses: vi.fn(),
  findLikes: vi.fn(),
  aggregateLikes: vi.fn(),
  findShops: vi.fn(),
  findUsers: vi.fn(),
}));

vi.mock("../../models/course.model.js", () => ({
  default: { find: modelMocks.findCourses },
}));
vi.mock("../../models/course-like.model.js", () => ({
  default: {
    find: modelMocks.findLikes,
    aggregate: modelMocks.aggregateLikes,
  },
}));
vi.mock("../../models/shop.model.js", () => ({
  default: { find: modelMocks.findShops },
}));
vi.mock("../../models/user.model.js", () => ({
  default: { find: modelMocks.findUsers },
}));

import {
  getMyCourseList,
  getMyLikedCourseList,
} from "./course-list.service.js";

const userId = "6a8a68e15e2aa43be6a6549d";
const courseId = new Types.ObjectId("6a8a68e15e2aa43be6a6549e");
const shopId = new Types.ObjectId("6a8a68e15e2aa43be6a6549f");
const createdAt = new Date("2026-11-01T00:00:00.000Z");

const course = {
  _id: courseId,
  courseType: "user_created" as const,
  userId: new Types.ObjectId(userId),
  sourceFolderId: null,
  title: "성수 산책",
  description: null,
  regionGroup: "seongsu-seoulforest" as const,
  isPublic: true,
  likeCount: 7,
  shops: [{ shopId, order: 1 }],
  createdAt,
  updatedAt: createdAt,
};

/** 목록 서비스가 사용하는 정렬·제한·선택 조회 체인을 만듭니다. */
function listQuery(value: unknown) {
  return {
    sort: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(value),
        }),
      }),
    }),
  };
}

/** 목록 서비스가 사용하는 선택 조회 체인을 만듭니다. */
function selectedQuery(value: unknown) {
  return {
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(value),
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  modelMocks.findShops.mockReturnValue(selectedQuery([]));
  modelMocks.findUsers.mockReturnValue(selectedQuery([]));
  modelMocks.aggregateLikes.mockResolvedValue([{ _id: courseId, count: 99 }]);
});

describe("course list stored likeCount", () => {
  it("내 코스 목록은 저장된 likeCount를 반환한다", async () => {
    modelMocks.findCourses.mockReturnValue(listQuery([course]));

    const result = await getMyCourseList(userId, { limit: 10 });

    expect(result.items[0]?.likeCount).toBe(7);
  });

  it("찜한 코스 목록은 저장된 likeCount를 반환한다", async () => {
    modelMocks.findLikes.mockReturnValue(
      listQuery([{ _id: new Types.ObjectId(), courseId, createdAt }]),
    );
    modelMocks.findCourses.mockReturnValue(selectedQuery([course]));

    const result = await getMyLikedCourseList(userId, { limit: 10 });

    expect(result.items[0]).toMatchObject({
      isPrivate: false,
      likeCount: 7,
    });
  });
});
