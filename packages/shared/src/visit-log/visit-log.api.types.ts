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

/** GET /api/shops/:shopId/visit-logs/availability 조회 조건 */
export type CheckVisitLogAvailabilityQuery = Readonly<{
  visitedAt: string;
}>;

/** 같은 상점과 방문일에 새 로그를 작성할 수 있는지 나타냅니다. */
export type CheckVisitLogAvailabilityData = Readonly<{
  canCreate: boolean;
}>;

/** GET /api/shops/:shopId/visit-logs/availability 성공 응답 */
export type CheckVisitLogAvailabilityResponse =
  ApiSuccessResponse<CheckVisitLogAvailabilityData>;

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

export type MyVisitLogShop = Readonly<{
  id: string;
  name: string;
  imageUrl: string | null;
  address: string;
}>;

export type MyVisitLogListItem = Readonly<{
  id: string;
  shop: MyVisitLogShop;
  selectedTagKeys: readonly TagKey[];
  content: string | null;
  imageUrls: readonly string[];
  visitedAt: string;
  createdAt: string;
  updatedAt: string;
}>;

export type GetMyVisitLogsQuery = Readonly<{
  page?: number;
  limit?: number;
}>;

export type MyVisitLogListData = Readonly<{
  items: MyVisitLogListItem[];
  pagination: Pagination;
  summary: Readonly<{
    totalCount: number;
    uniqueShopCount: number;
  }>;
}>;

/** GET /api/me/visit-logs 성공 응답 */
export type GetMyVisitLogsResponse = ApiSuccessResponse<MyVisitLogListData>;

/** GET /api/me/visit-logs/:visitLogId 성공 응답 */
export type GetMyVisitLogResponse = ApiSuccessResponse<MyVisitLogListItem>;

/** PATCH /api/visit-logs/:visitLogId 요청 데이터 */
export type UpdateVisitLogRequest = Readonly<{
  visitedAt: string;
  selectedTagKeys: readonly TagKey[];
  content?: string | null;
}>;

export type UpdateVisitLogData = Readonly<{
  visitLogId: string;
}>;

/** PATCH /api/visit-logs/:visitLogId 성공 응답 */
export type UpdateVisitLogResponse = ApiSuccessResponse<UpdateVisitLogData>;

export type DeleteVisitLogData = Readonly<{
  visitLogId: string;
}>;

/** DELETE /api/visit-logs/:visitLogId 성공 응답 */
export type DeleteVisitLogResponse = ApiSuccessResponse<DeleteVisitLogData>;
