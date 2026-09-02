import { randomInt } from "node:crypto";

import {
  NICKNAME_ADJECTIVES,
  NICKNAME_MAX_LENGTH,
  NICKNAME_NOUN,
  NICKNAME_NUMBER_DIGITS,
} from "../constants/nickname.constants.js";

/**
 * 신규 사용자에게 사용할 랜덤 닉네임을 생성합니다.
 *
 * 예:
 * 쇼핑하는쿼카731
 */
export function createRandomNickname() {
  const adjective = NICKNAME_ADJECTIVES[randomInt(NICKNAME_ADJECTIVES.length)];

  /**
   * 명사는 "쿼카"로 고정합니다.
   */
  const noun = NICKNAME_NOUN;

  /**
   * 0 ~ 999 사이의 랜덤 숫자를 생성합니다.
   */
  const number = randomInt(10 ** NICKNAME_NUMBER_DIGITS);

  /**
   * 항상 3자리 문자열로 맞춥니다.
   *
   * 3   → "003"
   * 42  → "042"
   * 731 → "731"
   */
  const numberText = number.toString().padStart(NICKNAME_NUMBER_DIGITS, "0");

  const nickname = `${adjective} ${noun}${numberText}`;

  /**
   * constants에 너무 긴 수식어가 추가되는 실수를
   * 빠르게 발견하기 위한 방어 코드입니다.
   */
  if (nickname.length > NICKNAME_MAX_LENGTH) {
    throw new Error(
      `생성된 닉네임이 최대 길이 ${NICKNAME_MAX_LENGTH}자를 초과했습니다.`,
    );
  }

  return nickname;
}
