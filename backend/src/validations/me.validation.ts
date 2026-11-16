import { z } from "zod";

import {
  DEFAULT_VISITED_SHOP_LIST_LIMIT,
  MAX_VISITED_SHOP_LIST_LIMIT,
} from "@sopum-map/shared";

import { createPaginationQuerySchema } from "./pagination.validation.js";

import {
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
} from "../constants/nickname.constants.js";

/** 현재 로그인한 사용자의 프로필 수정 요청을 검증합니다. */
export const updateMyProfileSchema = z.object({
  body: z.object({
    nickname: z
      .string()
      .trim()
      .min(NICKNAME_MIN_LENGTH)
      .max(NICKNAME_MAX_LENGTH),
  }),
});

/** 내 방문 상점 목록의 페이지 요청을 검증합니다. */
export const getMyVisitedShopsQuerySchema = createPaginationQuerySchema({
  defaultLimit: DEFAULT_VISITED_SHOP_LIST_LIMIT,
  maxLimit: MAX_VISITED_SHOP_LIST_LIMIT,
});

/** 내 방문 상점 조회 요청 전체를 검증합니다. */
export const getMyVisitedShopsSchema = z.object({
  query: getMyVisitedShopsQuerySchema,
});
