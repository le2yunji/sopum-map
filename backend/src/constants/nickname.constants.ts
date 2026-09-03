export const NICKNAME_ADJECTIVES = [
  "구경하는",
  "쇼핑하는",
  "득템하는",
  "고민하는",
  "기웃대는",
  "충동구매하는",
  "지갑여는",
  "텅장되는",
  "소품찾는",
  "사진찍는",
  "구경만하는",
  "선물고르는",
  "소품모으는",
  "키링모으는",
  "기록하는",
  "취향찾는",
  "보물찾는",
  "산책하는",
] as const;

export const NICKNAME_NOUN = "쿼카" as const;

/**
 * User.nickname 최대 길이
 */
export const NICKNAME_MAX_LENGTH = 12;

/**
 * 랜덤 닉네임 뒤에 붙일 숫자 자릿수
 *
 * 000 ~ 999
 */
export const NICKNAME_NUMBER_DIGITS = 3;

/**
 * 랜덤 닉네임 생성 충돌 최대 재시도 횟수
 */
export const NICKNAME_GENERATION_MAX_RETRIES = 20;
