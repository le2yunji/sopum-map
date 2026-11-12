import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getHomeCourseRecommendations,
  getOrCreateHomeCourseSnapshot,
} from "./course-home.service.js";

const modelMocks = vi.hoisted(() => ({
  findSnapshot: vi.fn(),
  selectSnapshot: vi.fn(),
  leanSnapshot: vi.fn(),
  updateSnapshot: vi.fn(),

  findCourses: vi.fn(),
  sortCourses: vi.fn(),
  limitCourses: vi.fn(),
  selectCourses: vi.fn(),
  leanCourses: vi.fn(),
  loadItems: vi.fn(),
  aggregateLikes: vi.fn(),
}));

vi.mock("../../models/course-home-recommendation.model.js", () => ({
  default: {
    findOne: modelMocks.findSnapshot,
    updateOne: modelMocks.updateSnapshot,
  },
}));

vi.mock("../../models/course.model.js", () => ({
  default: {
    find: modelMocks.findCourses,
    collection: {
      name: "courses",
    },
  },
}));

vi.mock("../../models/course-like.model.js", () => ({
  default: {
    aggregate: modelMocks.aggregateLikes,
  },
}));

vi.mock("./public-course-display.service.js", () => ({
  loadPublicCourseListItems: modelMocks.loadItems,
}));

const latestCourseId = new Types.ObjectId("6a8a68e15e2aa43be6a6549d");
const popularCourseId = new Types.ObjectId("6a8a68e15e2aa43be6a6549e");

const now = new Date("2026-11-11T03:00:00.000Z");
const startAt = new Date("2026-11-10T15:00:00.000Z");
const recentLikeStartAt = new Date("2026-11-03T15:00:00.000Z");
const expiresAt = new Date("2026-11-24T15:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();

  modelMocks.findSnapshot.mockReturnValue({
    select: modelMocks.selectSnapshot,
  });
  modelMocks.selectSnapshot.mockReturnValue({
    lean: modelMocks.leanSnapshot,
  });

  modelMocks.findCourses.mockReturnValue({
    sort: modelMocks.sortCourses,
  });
  modelMocks.sortCourses.mockReturnValue({
    limit: modelMocks.limitCourses,
  });
  modelMocks.limitCourses.mockReturnValue({
    select: modelMocks.selectCourses,
  });
  modelMocks.selectCourses.mockReturnValue({
    lean: modelMocks.leanCourses,
  });

  modelMocks.leanCourses.mockResolvedValue([{ _id: latestCourseId }]);
  modelMocks.aggregateLikes.mockResolvedValue([
    {
      _id: popularCourseId,
      likeCount: 2,
      latestLikedAt: new Date("2026-11-10T12:00:00.000Z"),
    },
  ]);
  modelMocks.updateSnapshot.mockResolvedValue({
    acknowledged: true,
  });

  modelMocks.loadItems.mockImplementation(
    async (courses: readonly Readonly<{ _id: Types.ObjectId }>[]) =>
      courses.map((course) => ({
        id: course._id.toString(),
      })),
  );
});

describe("getOrCreateHomeCourseSnapshot", () => {
  it("한국 날짜 시작 전의 공개 코스와 최근 7일 좋아요로 스냅샷을 만든다", async () => {
    const savedSnapshot = {
      dateKey: "2026-11-11",
      candidateCourseIds: [latestCourseId, popularCourseId],
      expiresAt,
    };

    modelMocks.leanSnapshot
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(savedSnapshot);

    const result = await getOrCreateHomeCourseSnapshot(now);

    expect(modelMocks.findCourses).toHaveBeenCalledWith({
      isPublic: true,
      createdAt: {
        $lt: startAt,
      },
    });

    expect(modelMocks.sortCourses).toHaveBeenCalledWith({
      createdAt: -1,
      _id: -1,
    });
    expect(modelMocks.limitCourses).toHaveBeenCalledWith(20);

    expect(modelMocks.aggregateLikes).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          $match: {
            createdAt: {
              $gte: recentLikeStartAt,
              $lt: startAt,
            },
          },
        },
      ]),
    );

    expect(modelMocks.updateSnapshot).toHaveBeenCalledWith(
      {
        dateKey: "2026-11-11",
      },
      {
        $setOnInsert: {
          dateKey: "2026-11-11",
          candidateCourseIds: expect.arrayContaining([
            latestCourseId,
            popularCourseId,
          ]),
          expiresAt,
        },
      },
      {
        upsert: true,
      },
    );

    expect(result).toEqual(savedSnapshot);
  });

  it("같은 날짜의 스냅샷이 있으면 후보를 다시 계산하지 않는다", async () => {
    const existingSnapshot = {
      dateKey: "2026-11-11",
      candidateCourseIds: [latestCourseId],
      expiresAt,
    };

    modelMocks.leanSnapshot.mockResolvedValue(existingSnapshot);

    const result = await getOrCreateHomeCourseSnapshot(now);

    expect(result).toEqual(existingSnapshot);
    expect(modelMocks.findCourses).not.toHaveBeenCalled();
    expect(modelMocks.aggregateLikes).not.toHaveBeenCalled();
    expect(modelMocks.updateSnapshot).not.toHaveBeenCalled();
  });
});

describe("getHomeCourseRecommendations", () => {
  it("공개 후보를 스냅샷 순서로 복원하고 서로 다른 지역을 우선해 세 개를 고른다", async () => {
    const firstMangwonId = new Types.ObjectId("6a8a68e15e2aa43be6a654a1");
    const privateCourseId = new Types.ObjectId("6a8a68e15e2aa43be6a654a2");
    const secondMangwonId = new Types.ObjectId("6a8a68e15e2aa43be6a654a3");
    const seochonId = new Types.ObjectId("6a8a68e15e2aa43be6a654a4");
    const hongdaeId = new Types.ObjectId("6a8a68e15e2aa43be6a654a5");

    const candidateCourseIds = [
      firstMangwonId,
      privateCourseId,
      secondMangwonId,
      seochonId,
      hongdaeId,
    ];

    modelMocks.leanSnapshot.mockResolvedValue({
      dateKey: "2026-11-11",
      candidateCourseIds,
      expiresAt,
    });

    modelMocks.findCourses.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue([
        {
          _id: hongdaeId,
          regionGroup: "hongdae-yeonnam",
        },
        {
          _id: secondMangwonId,
          regionGroup: "mangwon",
        },
        {
          _id: firstMangwonId,
          regionGroup: "mangwon",
        },
        {
          _id: seochonId,
          regionGroup: "seochon",
        },
      ]),
    });

    const result = await getHomeCourseRecommendations(now);

    expect(modelMocks.findCourses).toHaveBeenCalledWith({
      _id: {
        $in: candidateCourseIds,
      },
      isPublic: true,
    });

    expect(modelMocks.loadItems).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: firstMangwonId,
      }),
      expect.objectContaining({
        _id: seochonId,
      }),
      expect.objectContaining({
        _id: hongdaeId,
      }),
    ]);

    expect(result).toEqual({
      items: [
        {
          id: firstMangwonId.toString(),
        },
        {
          id: seochonId.toString(),
        },
        {
          id: hongdaeId.toString(),
        },
      ],
    });
  });
});
