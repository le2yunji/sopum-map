import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import type {
  ShopDetailView,
  ShopReviewPreview,
} from "../_types/shop-detail.types";

import { ShopDetailScreen } from "./ShopDetailScreen";

const firstReview: ShopReviewPreview = {
  id: "review-1",
  author: "소품러버",
  avatarUrl: "/images/profiles/user_default.webp",
  date: "2026.08.10",
  content:
    "아기자기한 소품이 많아서 구경하는 재미가 있었어요. 문구류 종류도 다양하고 선물 고르기 좋았습니다.",
  imageUrls: [
    "/images/shops/shop_example.png",
    "/images/profiles/shop_default.webp",
  ],
};

const secondReview: ShopReviewPreview = {
  id: "review-2",
  author: "성수산책",
  avatarUrl: "/images/profiles/user_default.webp",
  date: "2026.08.08",
  content:
    "성수 구경하다가 들르기 좋아요. 매장은 크지 않지만 귀여운 제품들이 많았습니다.",
  imageUrls: [],
};

const defaultShop: ShopDetailView = {
  id: "shop-1",
  name: "오브젝트 성수",
  category: "소품샵",
  distance: "1.2km",
  tags: ["문구", "캐릭터", "선물", "다꾸"],

  imageUrls: [
    "/images/shops/shop_example.png",
    "/images/profiles/shop_default.webp",
    "/images/shops/shop_example.png",
  ],

  mapImageUrl: "/images/shops/shop_example.png",
  address: "서울특별시 성동구 연무장길 33",

  naverMapUrl: "https://map.naver.com",
  smartStoreUrl: "https://smartstore.naver.com",

  hours: "12:00 - 20:00",
  closedDay: "매주 월요일",

  likeCount: 128,
  reviewCount: 2,
  reviews: [firstReview, secondReview],
};

const meta = {
  title: "Shop/ShopDetailScreen",
  component: ShopDetailScreen,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-black-100">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShopDetailScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    shop: defaultShop,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("link", { name: "후기 작성하기" }),
    ).toHaveAttribute("href", "/shops/shop-1/reviews/new");
  },
};

export const NoReviews: Story = {
  args: {
    shop: {
      ...defaultShop,
      reviewCount: 0,
      reviews: [],
    },
  },
};

export const NoExternalLinks: Story = {
  args: {
    shop: {
      ...defaultShop,
      naverMapUrl: undefined,
      smartStoreUrl: undefined,
    },
  },
};

export const NoSmartStore: Story = {
  args: {
    shop: {
      ...defaultShop,
      smartStoreUrl: undefined,
    },
  },
};

export const ManyTags: Story = {
  args: {
    shop: {
      ...defaultShop,
      tags: [
        "문구",
        "캐릭터",
        "키링",
        "인형",
        "엽서",
        "스티커",
        "다꾸",
        "선물",
      ],
    },
  },
};

export const SingleImage: Story = {
  args: {
    shop: {
      ...defaultShop,
      imageUrls: ["/images/shops/shop_example.png"],
    },
  },
};

export const NoImages: Story = {
  args: {
    shop: {
      ...defaultShop,
      imageUrls: [],
    },
  },
};

const longReview: ShopReviewPreview = {
  id: "review-long",
  author: "성수소품탐방",
  avatarUrl: "/images/profiles/user_default.webp",
  date: "2026.08.12",
  content:
    "매장 내부에 정말 다양한 종류의 소품이 있어서 예상했던 것보다 훨씬 오래 구경했습니다. 문구류부터 캐릭터 상품, 키링, 인형까지 종류가 다양하고 진열도 깔끔해서 제품을 천천히 살펴보기 좋았어요. 성수에 방문한다면 한 번쯤 들러볼 만한 소품샵이라고 생각합니다.",
  imageUrls: [
    "/images/shops/shop_example.png",
    "/images/shops/shop_example.png",
  ],
};

const reviewImages = [
  "/images/shops/shop_example.png",
  "/images/profiles/shop_default.webp",
  "/images/brand/mascot-v2.webp",
  "/images/brand/mascot.webp",
  "/images/profiles/user_default.webp",
] as const;

/** 사진 개수별 가로 스크롤 배치를 한 화면에서 비교합니다. */
const imageCountReviews: ShopReviewPreview[] = [1, 2, 3, 4, 5].map(
  (imageCount) => ({
    id: `review-images-${imageCount}`,
    author: `사진 ${imageCount}장 후기`,
    avatarUrl: "/images/profiles/user_default.webp",
    date: "2026.08.16",
    content: `정사각형 사진이 ${imageCount}장 있을 때의 배치입니다.`,
    imageUrls: reviewImages.slice(0, imageCount),
  }),
);

export const ReviewImageCounts: Story = {
  args: {
    shop: {
      ...defaultShop,
      reviewCount: imageCountReviews.length,
      reviews: imageCountReviews,
    },
  },
};

export const LongContent: Story = {
  args: {
    shop: {
      ...defaultShop,
      name: "아주 길고 긴 이름을 가진 성수동 소품 편집샵",
      address:
        "서울특별시 성동구 성수이로 어딘가에 위치한 아주 긴 주소를 가진 소품샵",
      hours: "평일 11:00 - 21:00 / 주말 및 공휴일 10:00 - 22:00",
      tags: ["문구", "캐릭터", "인형", "키링", "스티커", "엽서"],
      reviewCount: 1,
      reviews: [longReview],
    },
  },
};
