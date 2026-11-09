import { z } from "zod";

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
