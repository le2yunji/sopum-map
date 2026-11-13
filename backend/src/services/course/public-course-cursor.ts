import { Types } from "mongoose";

import { createApiError, type PublicCourseSort } from "@sopum-map/shared";

export type PublicCourseCursor = Readonly<
  | {
      sort: "latest";
      createdAt: Date;
      id: Types.ObjectId;
    }
  | {
      sort: "popular";
      likeCount: number;
      createdAt: Date;
      id: Types.ObjectId;
    }
>;

type SerializedPublicCourseCursor = Readonly<{
  sort: PublicCourseSort;
  likeCount?: number;
  createdAt: string;
  id: string;
}>;

/** 공개 코스 목록의 마지막 정렬 위치를 클라이언트가 해석할 수 없는 문자열로 만듭니다. */
export function encodePublicCourseCursor(input: PublicCourseCursor): string {
  const cursor: SerializedPublicCourseCursor = {
    sort: input.sort,
    createdAt: input.createdAt.toISOString(),
    id: input.id.toString(),

    ...(input.sort === "popular"
      ? {
          likeCount: input.likeCount,
        }
      : {}),
  };

  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

/** 공개 코스 커서를 검증하고 MongoDB 정렬 조건에 사용할 값으로 복원합니다. */
export function decodePublicCourseCursor(
  cursor: string,
  expectedSort: PublicCourseSort,
): PublicCourseCursor {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as Partial<SerializedPublicCourseCursor>;

    const createdAt = new Date(decoded.createdAt ?? "");
    const id = decoded.id;

    if (
      decoded.sort !== expectedSort ||
      !Number.isFinite(createdAt.getTime()) ||
      typeof id !== "string" ||
      !Types.ObjectId.isValid(id)
    ) {
      throw new Error("Invalid course cursor");
    }

    const objectId = new Types.ObjectId(id);

    if (decoded.sort === "popular") {
      const likeCount = decoded.likeCount;

      if (
        typeof likeCount !== "number" ||
        !Number.isInteger(likeCount) ||
        likeCount < 0
      ) {
        throw new Error("Invalid popular course cursor");
      }

      return {
        sort: "popular",
        likeCount,
        createdAt,
        id: objectId,
      };
    }

    return {
      sort: "latest",
      createdAt,
      id: objectId,
    };
  } catch {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_CURSOR",
      message: "공개 코스 목록 커서가 올바르지 않습니다.",
    });
  }
}
