import type { HomeData } from "../_types/home.types";

const DEFAULT_SHOP_IMAGE = "/images/shops/shop_example.png";
const FALLBACK_SHOP_IMAGE = "/images/profiles/shop_default.webp";

export const HOME_DATA: HomeData = {
  curation: [
    {
      id: "momone",
      href: "/shops/momone",
      name: "모모네 소품샵",
      imageUrl: DEFAULT_SHOP_IMAGE,
      region: "서울숲",
      description: "빈티지 문구와 일러스트",
      tags: [
        { id: "seongsu", name: "성수" },
        { id: "stationery", name: "다꾸용품" },
      ],
    },
    {
      id: "page-mate",
      href: "/shops/page-mate",
      name: "페이지 메이트",
      imageUrl: FALLBACK_SHOP_IMAGE,
      region: "망원동",
      description: "작은 종이 취향 상점",
      tags: [
        { id: "mangwon", name: "망원동" },
        { id: "paper", name: "문구" },
      ],
    },
  ],
  categories: [
    { value: "all", label: "전체" },
    { value: "stationery", label: "문구" },
    { value: "character", label: "캐릭터" },
    { value: "gift", label: "선물" },
    { value: "miniature", label: "미니어처" },
  ],
  shopsByCategory: {
    all: [
      {
        id: "momone",
        name: "모모네 소품샵",
        imageUrl: DEFAULT_SHOP_IMAGE,
        region: "서울 성동구 서울숲",
        tags: ["가챠", "캐릭터"],
        isLiked: true,
      },
      {
        id: "lucky-clover",
        name: "럭키 클로버",
        imageUrl: FALLBACK_SHOP_IMAGE,
        region: "서울 마포구 연남동",
        tags: ["빈티지", "선물"],
      },
    ],
    stationery: [
      {
        id: "page-mate",
        name: "페이지 메이트",
        imageUrl: DEFAULT_SHOP_IMAGE,
        region: "서울 마포구 망원동",
        tags: ["문구", "다꾸"],
      },
    ],
    character: [
      {
        id: "momone-character",
        name: "모모 캐릭터 상점",
        imageUrl: DEFAULT_SHOP_IMAGE,
        region: "서울 성동구 성수동",
        tags: ["캐릭터", "키링"],
      },
    ],
    gift: [],
    miniature: [],
  },
  courses: [
    {
      id: "mangwon-tour",
      title: "망원동 소품샵 투어",
      description: "망원시장 → 페이지 메이트 → 작은 선물가게",
      imageUrls: [DEFAULT_SHOP_IMAGE, FALLBACK_SHOP_IMAGE],
      tags: ["힐링", "문구", "선물"],
    },
    {
      id: "seongsu-interior",
      title: "성수동 인테리어 소품 투어",
      description: "서울숲에서 시작하는 취향 산책",
      imageUrls: [FALLBACK_SHOP_IMAGE],
      tags: ["미니멀", "인테리어"],
    },
  ],
};
