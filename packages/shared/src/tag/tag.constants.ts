import { TagKey } from "./tag.types";

export const TAG_GROUPS = [
  "mood",
  "product",
  "character",
  "price",
  "shopping",
  "experience",
  "feature",
  "trend",
  "etc",
] as const;

export const TAG_DEFINITIONS = [
  // ─────────────────────────────
  // 분위기 / 취향
  // ─────────────────────────────
  {
    key: "cute",
    selectionLabel: "아기자기한 소품이 많아요",
    shortLabel: "아기자기",
    group: "mood",
    isActive: true,
  },
  {
    key: "vintage",
    selectionLabel: "빈티지한 소품이 많아요",
    shortLabel: "빈티지",
    group: "mood",
    isActive: true,
  },
  {
    key: "cozy",
    selectionLabel: "포근한 감성이에요",
    shortLabel: "포근한 감성",
    group: "mood",
    isActive: true,
  },
  {
    key: "hip",
    selectionLabel: "힙한 소품이 많아요",
    shortLabel: "힙한",
    group: "mood",
    isActive: true,
  },
  {
    key: "lovely",
    selectionLabel: "러블리한 소품이 많아요",
    shortLabel: "러블리",
    group: "mood",
    isActive: true,
  },
  {
    key: "kitsch",
    selectionLabel: "키치한 소품이 많아요",
    shortLabel: "키치",
    group: "mood",
    isActive: true,
  },
  {
    key: "calm",
    selectionLabel: "차분한 감성이에요",
    shortLabel: "차분한",
    group: "mood",
    isActive: true,
  },
  {
    key: "unique",
    selectionLabel: "취향 확실한 소품이 많아요",
    shortLabel: "취향 확실",
    group: "mood",
    isActive: true,
  },
  {
    key: "quirky",
    selectionLabel: "엉뚱하고 재치 있는 소품이 많아요",
    shortLabel: "재치 있는",
    group: "mood",
    isActive: true,
  },

  // ─────────────────────────────
  // 상품 종류
  // ─────────────────────────────
  {
    key: "stationery",
    selectionLabel: "문구 종류가 다양해요",
    shortLabel: "문구 다양",
    group: "product",
    isActive: true,
  },
  {
    key: "stickers",
    selectionLabel: "스티커 종류가 다양해요",
    shortLabel: "스티커",
    group: "product",
    isActive: true,
  },
  {
    key: "diary_supplies",
    selectionLabel: "다꾸템이 많아요",
    shortLabel: "다꾸템",
    group: "product",
    isActive: true,
  },
  {
    key: "keyrings",
    selectionLabel: "키링 종류가 다양해요",
    shortLabel: "키링",
    group: "product",
    isActive: true,
  },
  {
    key: "plush",
    selectionLabel: "인형 종류가 다양해요",
    shortLabel: "인형",
    group: "product",
    isActive: true,
  },
  {
    key: "figures",
    selectionLabel: "피규어 종류가 다양해요",
    shortLabel: "피규어",
    group: "product",
    isActive: true,
  },
  {
    key: "postcards",
    selectionLabel: "엽서와 포스터가 다양해요",
    shortLabel: "엽서·포스터",
    group: "product",
    isActive: true,
  },
  {
    key: "interior",
    selectionLabel: "인테리어 소품이 많아요",
    shortLabel: "인테리어 소품",
    group: "product",
    isActive: true,
  },
  {
    key: "accessories",
    selectionLabel: "액세서리가 다양해요",
    shortLabel: "액세서리",
    group: "product",
    isActive: true,
  },
  {
    key: "phone_accessories",
    selectionLabel: "폰꾸 아이템이 많아요",
    shortLabel: "폰꾸템",
    group: "product",
    isActive: true,
  },

  // ─────────────────────────────
  // 캐릭터 / IP
  // ─────────────────────────────
  {
    key: "sanrio",
    selectionLabel: "산리오 상품이 많아요",
    shortLabel: "산리오",
    group: "character",
    isActive: true,
  },
  {
    key: "shinchan",
    selectionLabel: "짱구 상품이 많아요",
    shortLabel: "짱구",
    group: "character",
    isActive: true,
  },
  {
    key: "disney",
    selectionLabel: "디즈니 상품이 많아요",
    shortLabel: "디즈니",
    group: "character",
    isActive: true,
  },
  {
    key: "ghibli",
    selectionLabel: "지브리 상품이 많아요",
    shortLabel: "지브리",
    group: "character",
    isActive: true,
  },
  {
    key: "pokemon",
    selectionLabel: "포켓몬 상품이 많아요",
    shortLabel: "포켓몬",
    group: "character",
    isActive: true,
  },
  {
    key: "japanese_anime",
    selectionLabel: "일본 애니 캐릭터 상품이 많아요",
    shortLabel: "일본 애니 굿즈",
    group: "character",
    isActive: true,
  },
  {
    key: "original_character",
    selectionLabel: "자체 캐릭터 상품이 많아요",
    shortLabel: "자체 캐릭터",
    group: "character",
    isActive: true,
  },

  // ─────────────────────────────
  // 가격
  // ─────────────────────────────
  {
    key: "affordable",
    selectionLabel: "부담 없이 사기 좋아요",
    shortLabel: "가격 부담 적음",
    group: "price",
    isActive: true,
  },
  {
    key: "good_value",
    selectionLabel: "가격 대비 만족도가 높아요",
    shortLabel: "가성비",
    group: "price",
    isActive: true,
  },
  {
    key: "small_purchase",
    selectionLabel: "소소하게 하나씩 사기 좋아요",
    shortLabel: "소소한 소비",
    group: "price",
    isActive: true,
  },
  {
    key: "premium",
    selectionLabel: "퀄리티 좋은 상품이 많아요",
    shortLabel: "퀄리티 좋은",
    group: "price",
    isActive: true,
  },

  // ─────────────────────────────
  // 쇼핑 목적 / 취향
  // ─────────────────────────────
  {
    key: "good_for_gifts",
    selectionLabel: "선물 고르기 좋아요",
    shortLabel: "선물 추천",
    group: "shopping",
    isActive: true,
  },
  {
    key: "good_for_diary",
    selectionLabel: "다꾸템 고르기 좋아요",
    shortLabel: "다꾸 추천",
    group: "shopping",
    isActive: true,
  },

  {
    key: "good_for_souvenir",
    selectionLabel: "기념품 고르기 좋아요",
    shortLabel: "기념품 추천",
    group: "shopping",
    isActive: true,
  },
  {
    key: "good_for_browsing",
    selectionLabel: "구경하는 재미가 있어요",
    shortLabel: "구경맛집",
    group: "shopping",
    isActive: true,
  },

  // ─────────────────────────────
  // 방문 경험
  // ─────────────────────────────
  {
    key: "photo_spot",
    selectionLabel: "사진 남기기 좋아요",
    shortLabel: "사진맛집",
    group: "experience",
    isActive: true,
  },
  {
    key: "spacious",
    selectionLabel: "매장이 넓고 쾌적해요",
    shortLabel: "넓고 쾌적",
    group: "experience",
    isActive: true,
  },
  {
    key: "well_organized",
    selectionLabel: "상품 구경하기 편하게 정리되어 있어요",
    shortLabel: "구경하기 편한",
    group: "experience",
    isActive: true,
  },
  {
    key: "good_for_solo",
    selectionLabel: "혼자 천천히 구경하기 좋아요",
    shortLabel: "혼자 가기 좋은",
    group: "experience",
    isActive: true,
  },
  {
    key: "friendly",
    selectionLabel: "직원이 친절해요",
    shortLabel: "친절한",
    group: "experience",
    isActive: true,
  },
  {
    key: "lots_to_see",
    selectionLabel: "구경할 게 정말 많아요",
    shortLabel: "볼거리 많은",
    group: "experience",
    isActive: true,
  },

  // ─────────────────────────────
  // 매장 특징
  // ─────────────────────────────
  {
    key: "indie_artist",
    selectionLabel: "독립 작가 소품이 많아요",
    shortLabel: "작가 소품",
    group: "feature",
    isActive: true,
  },
  {
    key: "limited_edition",
    selectionLabel: "한정판 상품이 있어요",
    shortLabel: "한정판",
    group: "feature",
    isActive: true,
  },
  {
    key: "frequent_new_arrivals",
    selectionLabel: "신상이 자주 들어와요",
    shortLabel: "신상 많음",
    group: "feature",
    isActive: true,
  },
  {
    key: "rare_goods",
    selectionLabel: "남들이 잘 모르는 희귀템이 있어요",
    shortLabel: "희귀템",
    group: "feature",
    isActive: true,
  },
  {
    key: "collaboration",
    selectionLabel: "콜라보 상품이 많아요",
    shortLabel: "콜라보",
    group: "feature",
    isActive: true,
  },
  {
    key: "offline_only",
    selectionLabel: "오프라인에서 보는 재미가 있어요",
    shortLabel: "오프라인 추천",
    group: "feature",
    isActive: true,
  },

  // ─────────────────────────────
  // 요즘 유행템
  // ─────────────────────────────
  {
    key: "gacha",
    selectionLabel: "가챠 종류가 다양해요",
    shortLabel: "가챠",
    group: "trend",
    isActive: true,
  },
  {
    key: "plush_keyring",
    selectionLabel: "인형 키링이 많아요",
    shortLabel: "인형 키링",
    group: "trend",
    isActive: true,
  },
  {
    key: "squishy",
    selectionLabel: "말랑이가 다양해요",
    shortLabel: "말랑이",
    group: "trend",
    isActive: true,
  },
  {
    key: "slime",
    selectionLabel: "슬라임 종류가 다양해요",
    shortLabel: "슬라임",
    group: "trend",
    isActive: true,
  },
  {
    key: "keycap",
    selectionLabel: "귀여운 키캡이 많아요",
    shortLabel: "키캡",
    group: "trend",
    isActive: true,
  },
  {
    key: "clicker",
    selectionLabel: "클릭커 종류가 다양해요",
    shortLabel: "클릭커",
    group: "trend",
    isActive: true,
  },
  {
    key: "jibbitz",
    selectionLabel: "지비츠 종류가 다양해요",
    shortLabel: "지비츠",
    group: "trend",
    isActive: true,
  },
  {
    key: "lucky_turtle",
    selectionLabel: "행운 거북이가 있어요",
    shortLabel: "행운 거북이",
    group: "trend",
    isActive: true,
  },
  {
    key: "trend_item",
    selectionLabel: "유행템이 있어요",
    shortLabel: "유행템",
    group: "trend",
    isActive: true,
  },
] as const satisfies readonly {
  key: string;
  selectionLabel: string;
  shortLabel: string;
  group: (typeof TAG_GROUPS)[number];
  isActive: boolean;
}[];

export const TAG_KEYS = TAG_DEFINITIONS.map((tag) => tag.key);

export const ACTIVE_TAG_DEFINITIONS = TAG_DEFINITIONS.filter(
  (tag) => tag.isActive,
);

/**
 * 태그 key로 짧은 노출명을 조회
 *
 * 예:
 * cute -> 아기자기
 */
export const TAG_SHORT_LABELS = Object.fromEntries(
  TAG_DEFINITIONS.map(({ key, shortLabel }) => [key, shortLabel]),
) as Record<TagKey, string>;

/**
 * 태그 key로 긴 노출명을 조회
 *
 * 예:
 * cute -> 아기자기한 소품이 많아요
 */
export const TAG_SELECTION_LABELS = Object.fromEntries(
  TAG_DEFINITIONS.map(({ key, selectionLabel }) => [key, selectionLabel]),
) as Record<TagKey, string>;
