import type { ShopDetailData } from "@sopum-map/shared";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ShopDetailScreen } from "./ShopDetailScreen";

const defaultShop: ShopDetailData = {
  id: "shop-1",

  name: "오브젝트 성수",
  category: "소품샵",

  tags: [
    {
      key: "cute",
      count: 3,
      selectionLabel: "아기자기한 소품이 많아요",
      shortLabel: "아기자기",
      group: "mood",
    },
    {
      key: "stationery",
      count: 8,
      selectionLabel: "문구 종류가 다양해요",
      shortLabel: "문구 다양",
      group: "product",
    },
    {
      key: "good_for_browsing",
      count: 5,
      selectionLabel: "구경하는 재미가 있어요",
      shortLabel: "구경맛집",
      group: "shopping",
    },
  ],

  address: "서울특별시 성동구 연무장길 33",

  mainImageUrl: "/images/shops/shop_example.png",

  region1: "서울특별시",
  region2: "성동구",
  region3: "성수동2가",
  regionGroup: "seongsu-seoulforest",

  latitude: 37.5445,
  longitude: 127.056,

  status: "active",

  likeCount: 128,
  visitLogCount: 2,
  isLiked: false,

  phone: "0212345678",

  description: "문구와 캐릭터 소품을 만날 수 있는 성수동 소품샵입니다.",

  businessHours: [
    {
      day: "monday",
      isClosed: true,
      periods: [],
    },
    {
      day: "tuesday",
      isClosed: false,
      periods: [
        {
          open: "12:00",
          close: "20:00",
        },
      ],
    },
    {
      day: "wednesday",
      isClosed: false,
      periods: [
        {
          open: "12:00",
          close: "20:00",
        },
      ],
    },
    {
      day: "thursday",
      isClosed: false,
      periods: [
        {
          open: "12:00",
          close: "20:00",
        },
      ],
    },
    {
      day: "friday",
      isClosed: false,
      periods: [
        {
          open: "12:00",
          close: "20:00",
        },
      ],
    },
    {
      day: "saturday",
      isClosed: false,
      periods: [
        {
          open: "12:00",
          close: "20:00",
        },
      ],
    },
    {
      day: "sunday",
      isClosed: false,
      periods: [
        {
          open: "12:00",
          close: "20:00",
        },
      ],
    },
  ],

  businessHoursNote: "매주 월요일 휴무",

  instagramUrl: "https://www.instagram.com/example/",
  naverPlaceUrl: "https://m.place.naver.com/place/123456789/home",

  images: [
    {
      imageUrl: "/images/shops/shop_example.png",
      altText: "오브젝트 성수 매장",
      sourceUrl: null,
      sourceType: "official",
      isMain: true,
      order: 0,
    },
    {
      imageUrl: "/images/profiles/shop_default.webp",
      altText: "오브젝트 성수 내부",
      sourceUrl: null,
      sourceType: "official",
      isMain: false,
      order: 1,
    },
  ],

  sourceType: "admin",

  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-02T00:00:00.000Z",
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
      canvas.getByRole("link", {
        name: "후기 작성하기",
      }),
    ).toHaveAttribute("href", "/shops/shop-1/reviews/new");
  },
};

export const NoVisitLogs: Story = {
  args: {
    shop: {
      ...defaultShop,
      visitLogCount: 0,
    },
  },
};

export const NoExternalLinks: Story = {
  args: {
    shop: {
      ...defaultShop,
      instagramUrl: null,
      naverPlaceUrl: null,
    },
  },
};

export const NoPhone: Story = {
  args: {
    shop: {
      ...defaultShop,
      phone: null,
    },
  },
};

export const NoBusinessHours: Story = {
  args: {
    shop: {
      ...defaultShop,
      businessHours: [],
      businessHoursNote: null,
    },
  },
};

export const SingleImage: Story = {
  args: {
    shop: {
      ...defaultShop,

      mainImageUrl: "/images/shops/shop_example.png",

      images: [
        {
          imageUrl: "/images/shops/shop_example.png",
          altText: "오브젝트 성수 매장",
          sourceUrl: null,
          sourceType: "official",
          isMain: true,
          order: 0,
        },
      ],
    },
  },
};

export const NoImages: Story = {
  args: {
    shop: {
      ...defaultShop,
      mainImageUrl: null,
      images: [],
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

      description:
        "매장 내부에 다양한 종류의 문구와 캐릭터 상품, 키링, 인형, 엽서 등을 판매하고 있는 소품 편집샵입니다.",

      businessHoursNote:
        "공휴일 및 매장 사정에 따라 영업시간이 변경될 수 있습니다.",

      tags: [
        {
          key: "japanese_anime",
          count: 30,
          selectionLabel: "일본 애니 캐릭터 상품이 많아요",
          shortLabel: "일본 애니 굿즈",
          group: "character",
        },
        {
          key: "well_organized",
          count: 21,
          selectionLabel: "상품 구경하기 편하게 정리되어 있어요",
          shortLabel: "구경하기 편한",
          group: "experience",
        },
        {
          key: "frequent_new_arrivals",
          count: 17,
          selectionLabel: "신상이 자주 들어와요",
          shortLabel: "신상 많음",
          group: "feature",
        },
        {
          key: "good_for_browsing",
          count: 13,
          selectionLabel: "구경하는 재미가 있어요",
          shortLabel: "구경맛집",
          group: "shopping",
        },
      ],
    },
  },
};
