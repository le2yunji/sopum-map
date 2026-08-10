import type { ShopDetailView } from "../_types/shop-detail.types";

export const SHOP_DETAIL_FIXTURE: ShopDetailView = {
  id: "shop-1",
  name: "행운상점 연남",
  categoryLabel: "소품샵",
  description:
    "오래 간직하고 싶은 문구와 작은 선물을 천천히 발견할 수 있는 연남동 소품샵이에요.",
  images: [
    {
      id: "shop-image-1",
      imageUrl: "/images/shops/shop_example.png",
      alt: "행운상점 연남의 소품 진열대",
    },
    {
      id: "shop-image-2",
      imageUrl: "/images/profiles/shop_default.webp",
      alt: "행운상점 연남의 매장 전경",
    },
  ],
  tags: ["빈티지", "문구", "선물"],
  address: "서울 마포구 동교로 123",
  openingHours: "매일 12:00 - 20:00",
  phone: "02-1234-5678",
  instagramUrl: "https://www.instagram.com/sopummap",
  naverMapUrl: "https://map.naver.com",
  locationLabel: "홍대입구역에서 걸어서 8분",
  isLiked: false,
  likeCount: 128,
  pickFolders: [
    { id: "folder-1", name: "연남동 산책", shopCount: 4 },
    { id: "folder-2", name: "선물 후보", shopCount: 7 },
  ],
  reviews: [
    {
      id: "review-1",
      authorName: "초록수집가",
      visitedAt: "2026.08.02",
      content: "연남동 산책 중 발견했어요.",
      tags: ["친절해요", "구경하기 좋아요"],
    },
    {
      id: "review-2",
      authorName: "작은행운",
      visitedAt: "2026.07.28",
      content: "선물 고르기 좋은 곳이에요.",
      tags: ["선물이 많아요"],
    },
  ],
};

/** 동적 경로를 fixture 식별자에 반영해 화면 이동을 검증할 수 있게 합니다. */
export function getShopDetailFixture(shopId: string): ShopDetailView {
  return { ...SHOP_DETAIL_FIXTURE, id: shopId };
}
