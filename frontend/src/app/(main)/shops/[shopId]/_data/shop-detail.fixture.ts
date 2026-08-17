import type { ShopDetailView } from "../_types/shop-detail.types";

const SHOP_IMAGES = [
  "/images/shops/shop_example.png",
  "/images/profiles/shop_default.webp",
  "/images/brand/mascot-v2.webp",
  "/images/brand/mascot.webp",
] as const;

export const SHOP_DETAIL_FIXTURE: ShopDetailView = {
  id: "shop-1",
  name: "모모 소품샵",
  category: "소품샵",
  distance: "서울숲역 도보 5분",
  tags: ["아기자기", "다꾸", "선물"],
  imageUrls: SHOP_IMAGES,
  mapImageUrl: "/images/shops/shop_example.png",
  address: "서울 성동구 성수동 일대로 2",
  hours: "매일 11:00 - 20:00",
  closedDay: "매주 월요일 정기휴무",
  isLiked: false,
  likeCount: 124,
  reviewCount: 16,
  reviews: [
    { id: "review-1", author: "지윤이", avatarUrl: "/images/profiles/user_default.webp", date: "2026.08.10", content: "진짜 너무 귀엽고 아기자기해요. 소품샵 구경하기 좋았어요.", imageUrls: SHOP_IMAGES.slice(1, 3) },
    { id: "review-2", author: "하늘", avatarUrl: "/images/profiles/user_default.webp", date: "2026.08.02", content: "성수 갈 때마다 들르는 곳이에요. 예쁜 제품이 많아요.", imageUrls: [] },
    { id: "review-3", author: "민지", avatarUrl: "/images/profiles/user_default.webp", date: "2026.07.28", content: "선물 사러 갔다가 제 것도 잔뜩 샀어요.", imageUrls: SHOP_IMAGES.slice(2, 4) },
  ],
};
