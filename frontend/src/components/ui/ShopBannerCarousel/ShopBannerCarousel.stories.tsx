// ShopBannerCarousel.stories.tsx

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ShopBannerCarousel } from "./ShopBannerCarousel";
import type { ShopBannerItem } from "./ShopBannerCarousel.types";

const shopBannerItems: ShopBannerItem[] = [
  {
    id: "shop-1",
    href: "/shops/shop-1",
    name: "초록색 서랍장 (Green Drawer)",
    imageUrl: "/images/shops/shop_example.png",
    imageAlt: "밝은 분위기의 초록색 서랍장 매장 내부",
    region: "연남동",
    description: "빈티지 문구 & 일러스트",
    tags: [
      {
        id: "tag-yeonnam",
        name: "연남동",
      },
      {
        id: "tag-diary",
        name: "다꾸용품",
      },
    ],
  },
  {
    id: "shop-2",
    href: "/shops/shop-2",
    name: "오브젝트 상점",
    imageUrl: "/images/shops/shop_example.png",
    imageAlt: "다양한 생활 소품이 진열된 매장 내부",
    region: "망원동",
    description: "생활 소품 & 캐릭터 굿즈",
    tags: [
      {
        id: "tag-mangwon",
        name: "망원동",
      },
      {
        id: "tag-character",
        name: "캐릭터굿즈",
      },
    ],
  },
  {
    id: "shop-3",
    href: "/shops/shop-3",
    name: "작은 문구 작업실",
    imageUrl: "/images/shops/shop_example.png",
    imageAlt: "문구류와 일러스트 상품이 진열된 작업실",
    region: "서촌",
    description: "독립 문구 & 작가 굿즈",
    tags: [
      {
        id: "tag-seochon",
        name: "서촌",
      },
      {
        id: "tag-illustration",
        name: "일러스트",
      },
      {
        id: "tag-stationery",
        name: "문구",
      },
    ],
  },
];

const meta = {
  title: "Features/Shop/ShopBannerCarousel",
  component: ShopBannerCarousel,

  parameters: {
    layout: "fullscreen",
  },

  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[480px] py-6">
        <Story />
      </div>
    ),
  ],

  tags: ["autodocs"],

  argTypes: {
    items: {
      control: "object",
      description: "캐러셀에 표시할 매장 목록",
    },
    ariaLabel: {
      control: "text",
      description: "캐러셀 영역을 설명하는 접근성 라벨",
    },
    className: {
      control: "text",
      description: "최상위 section 요소에 추가할 클래스",
    },
  },

  args: {
    items: shopBannerItems,
    ariaLabel: "추천 소품샵",
  },
} satisfies Meta<typeof ShopBannerCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 기본 캐러셀 */
export const Default: Story = {};

/** 매장이 하나만 있는 경우 */
export const SingleItem: Story = {
  args: {
    items: [shopBannerItems[0]],
  },
};

/** 여러 매장을 좌우 스와이프로 탐색하는 경우 */
export const ManyItems: Story = {
  args: {
    items: [
      ...shopBannerItems,
      {
        id: "shop-4",
        href: "/shops/shop-4",
        name: "포근한 취향 상점",
        imageUrl: "/images/profiles/shop_default.webp",
        imageAlt: "따뜻한 분위기의 소품이 진열된 매장",
        region: "성수동",
        description: "패브릭 & 홈데코 소품",
        tags: [
          {
            id: "tag-seongsu",
            name: "성수동",
          },
          {
            id: "tag-home-decor",
            name: "홈데코",
          },
        ],
      },
    ],
  },
};

/** 긴 매장명과 설명의 말줄임 처리를 확인합니다. */
export const LongContent: Story = {
  args: {
    items: [
      {
        id: "shop-long-content",
        href: "/shops/shop-long-content",
        name: "일상 속에서 오래 간직하고 싶은 물건을 소개하는 작은 소품 상점",
        imageUrl: "/images/profiles/shop_default.webp",
        imageAlt: "다양한 소품이 진열된 작은 매장",
        region: "서울특별시 마포구 연남동",
        description:
          "빈티지 문구와 독립 작가의 일러스트 상품을 함께 소개하는 소품샵",
        tags: [
          {
            id: "tag-vintage",
            name: "빈티지",
          },
          {
            id: "tag-illustration",
            name: "일러스트",
          },
          {
            id: "tag-stationery",
            name: "문구",
          },
          {
            id: "tag-gift",
            name: "선물추천",
          },
        ],
      },
    ],
  },
};

/** 모바일 390px 화면에서 카드 크기와 스크롤을 확인합니다. */
export const Mobile390: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
    },
  },
};

/** 매장이 없으면 캐러셀을 렌더링하지 않습니다. */
export const Empty: Story = {
  args: {
    items: [],
  },

  render: (args) => (
    <div className="min-h-40">
      <ShopBannerCarousel {...args} />
    </div>
  ),
};
