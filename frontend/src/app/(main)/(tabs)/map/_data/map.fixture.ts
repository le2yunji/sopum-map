import type { MapShop } from "../_types/map.types";

export const MAP_SHOPS: MapShop[] = [
  {
    id: "gachagacha",
    name: "가챠가챠",
    address: "서울시 홍익구 홍익역 22-1",
    region: "홍대입구역 도보 12분",
    tags: ["가챠샵", "키치", "캐릭터"],
    imageUrl: "/images/shops/shop_example.png",
    latitude: 37.5575,
    longitude: 126.9247,
    isLiked: true,
  },
  {
    id: "momone",
    name: "모모네 소품샵",
    address: "서울시 성동구 서울숲로 12-2, 1층",
    region: "서울숲역 도보 5분",
    tags: ["가챠샵", "키치", "캐릭터"],
    imageUrl: "/images/shops/shop_example.png",
    latitude: 37.5448,
    longitude: 127.0445,
    isLiked: false,
  },
  {
    id: "lucky-clover",
    name: "럭키 클로버",
    address: "서울시 마포구 연남로 8",
    region: "홍대입구역 도보 8분",
    tags: ["문구", "미니멀"],
    imageUrl: "/images/icons/clover.webp",
    latitude: 37.5623,
    longitude: 126.9258,
    isLiked: false,
  },
];
