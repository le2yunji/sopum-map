import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ShopCard } from "./ShopCard";

const meta = {
  title: "Components/Shop/ShopCard",
  component: ShopCard,

  parameters: {
    layout: "centered",
  },

  tags: ["autodocs"],

  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact"],
      description: "매장 카드의 표시 형태",
    },

    name: {
      control: "text",
      description: "매장 이름",
    },

    imageUrl: {
      control: "text",
      description: "매장 대표 이미지 URL",
    },

    region: {
      control: "text",
      description: "매장 지역구",
    },

    tags: {
      control: "text",
      description: "매장 카테고리",
    },

    isLiked: {
      control: "boolean",
      description: "찜 여부",
    },

    onLikeClick: {
      action: "like-clicked",
      description: "찜 버튼 클릭 이벤트",
    },
  },

  args: {
    id: "shop-1",
    name: "모모 소품샵",
    imageUrl: "/images/profiles/shop_default.webp",
    region: "성수",
    tags: ["문구", "캐릭터", "다꾸"],
    isLiked: false,
    variant: "default",
  },

  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShopCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    variant: "compact",
  },

  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
};

export const Liked: Story = {
  args: {
    isLiked: true,
  },
};

export const WithoutImage: Story = {
  args: {
    imageUrl: null,
  },
};

export const LongName: Story = {
  args: {
    name: "아기자기한 문구와 소품을 판매하는 모모 소품샵 전포점",
  },
};
