import type { ApiSuccessResponse, Pagination } from "../api/api.types";
import type { TagKey } from "../tag/tag.types";

/** POST /api/shops/:shopId/visit-logs 요청 데이터 */
export type CreateVisitLogRequest = Readonly<{
  visitedAt: string;
  selectedTagKeys: readonly TagKey[];
  content?: string | null;
  imageKeys?: readonly string[];
}>;

/** POST /api/shops/:shopId/visit-logs 성공 데이터 */
export type CreateVisitLogData = Readonly<{
  visitLogId: string;
}>;

/** POST /api/shops/:shopId/visit-logs 성공 응답 */
export type CreateVisitLogResponse = ApiSuccessResponse<CreateVisitLogData>;

export type VisitLogAuthor = Readonly<{
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  isMe: boolean;
}>;

export type VisitLogListItem = Readonly<{
  id: string;
  author: VisitLogAuthor;
  selectedTagKeys: readonly TagKey[];
  content: string | null;
  imageUrls: readonly string[];
  visitedAt: string;
  createdAt: string;
}>;

export type GetVisitLogsQuery = Readonly<{
  page?: number;
  limit?: number;
}>;

export type VisitLogListData = Readonly<{
  items: VisitLogListItem[];
  pagination: Pagination;
}>;

/**
 * GET /api/shops/:shopId/visit-logs 성공 응답
 */
export type GetVisitLogsResponse = ApiSuccessResponse<VisitLogListData>;
