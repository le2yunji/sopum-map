import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BrandLoadingScreen } from "./BrandLoadingScreen";

const meta = {
  title: "App/BrandLoadingScreen",
  component: BrandLoadingScreen,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BrandLoadingScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "소품지도" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("img", { name: "소품지도 마스코트" }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole("link", { name: "시작하기" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("link", { name: "로그인하기" }),
    ).not.toBeInTheDocument();
  },
};

export const SmallMobile: Story = {
  globals: {
    viewport: {
      value: "sopumSmall",
      isRotated: false,
    },
  },
};

export const LargeMobile: Story = {
  globals: {
    viewport: {
      value: "sopumLarge",
      isRotated: false,
    },
  },
};
