import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BrandSplashScreen } from "./BrandSplashScreen";

const meta = {
  title: "Pages/Onboarding",
  component: BrandSplashScreen,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BrandSplashScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "소품지도" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("img", { name: "소품지도 심볼" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("행운을 찾는 소품산책"),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
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
