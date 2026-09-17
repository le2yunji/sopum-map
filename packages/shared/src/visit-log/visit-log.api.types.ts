import type { ApiSuccessResponse, Pagination } from "../api/api.types";

export type VisitLogAuthor = Readonly<{
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  isMe: boolean;
}>;

export type VisitLogListItem = Readonly<{
  id: string;
  author: VisitLogAuthor;
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
