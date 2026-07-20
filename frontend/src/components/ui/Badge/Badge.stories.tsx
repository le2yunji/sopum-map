import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./Badge";

const meta = {
  title: "Components/UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    children: "소품샵",
    variant: "green",
  },
  argTypes: {
    children: {
      description: "배지에 표시할 내용",
      control: "text",
    },
    variant: {
      description: "배지의 디자인 스타일",
      control: "select",
      options: ["green", "pink"],
      table: {
        defaultValue: {
          summary: "green",
        },
      },
    },
    className: {
      description: "배지에 추가로 적용할 CSS 클래스",
      control: "text",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 기본 스타일의 배지입니다.
 */
export const Default: Story = {};

/**
 * 높이 19px의 연두색 배지입니다.
 */
export const Green: Story = {
  args: {
    children: "소품샵",
    variant: "green",
  },
};

/**
 * 높이 26px의 분홍색 배지입니다.
 */
export const Pink: Story = {
  args: {
    children: "방문 완료",
    variant: "pink",
  },
};

/**
 * 텍스트 길이에 따라 배지의 가로 너비가
 * 자동으로 조절되는지 확인합니다.
 */
export const LongText: Story = {
  args: {
    children: "캐릭터 굿즈가 다양한 소품샵",
    variant: "pink",
  },
};

/**
 * 두 가지 배지 스타일을 함께 확인합니다.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge variant="green">소품샵</Badge>
      <Badge variant="pink">방문 완료</Badge>
    </div>
  ),
};
