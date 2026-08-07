import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Skeleton } from "./Skeleton";

const meta = {
  title: "Components/UI/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  args: {
    className: "h-24 w-64 rounded-2xl",
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status", {
      name: "콘텐츠를 불러오는 중",
    });

    await expect(status).toBeInTheDocument();
    await expect(status.firstElementChild).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  },
};

export const CustomLabel: Story = {
  args: {
    label: "온보딩 화면을 불러오는 중",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("status", { name: "온보딩 화면을 불러오는 중" }),
    ).toBeInTheDocument();
  },
};
