import { Types } from "mongoose";

import { createApiError } from "@sopum-map/shared";

type CourseCursor = Readonly<{
  createdAt: Date;
  id: Types.ObjectId;
}>;

type SerializedCourseCursor = Readonly<{
  createdAt: string;
  id: string;
}>;

/** 코스 목록의 마지막 정렬 위치를 클라이언트가 해석할 필요 없는 값으로 만듭니다. */
export function encodeCourseCursor({ createdAt, id }: CourseCursor): string {
  const cursor: SerializedCourseCursor = {
    createdAt: createdAt.toISOString(),
    id: id.toString(),
  };

  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

/** 코스 목록 커서를 검증하고 MongoDB 정렬 조건에 사용할 값으로 복원합니다. */
export function decodeCourseCursor(cursor: string): CourseCursor {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as Partial<SerializedCourseCursor>;

    const createdAt = new Date(decoded.createdAt ?? "");
    const id = decoded.id;

    if (
      !Number.isFinite(createdAt.getTime()) ||
      typeof id !== "string" ||
      !Types.ObjectId.isValid(id)
    ) {
      throw new Error("Invalid cursor fields");
    }

    return {
      createdAt,
      id: new Types.ObjectId(id),
    };
  } catch {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_CURSOR",
      message: "코스 목록 커서가 올바르지 않습니다.",
    });
  }
}
