// backend/src/services/visit-log/visit-log.mapper.ts

import type { VisitLogListItem } from "@sopum-map/shared";

type VisitLogMapperParams = Readonly<{
  visitLog: {
    _id: unknown;
    content?: string | null;
    imageUrls: string[];
    visitedAt: Date;
    createdAt: Date;
  };

  author: {
    id: string;
    nickname: string;
    profileImage: string | null;
    isMe: boolean;
  };
}>;

export function mapVisitLogListItem({
  visitLog,
  author,
}: VisitLogMapperParams): VisitLogListItem {
  return {
    id: String(visitLog._id),

    author: {
      id: author.id,
      nickname: author.nickname,
      profileImageUrl: author.profileImage,
      isMe: author.isMe,
    },

    content: visitLog.content ?? null,
    imageUrls: visitLog.imageUrls,

    visitedAt: visitLog.visitedAt.toISOString(),
    createdAt: visitLog.createdAt.toISOString(),
  };
}
