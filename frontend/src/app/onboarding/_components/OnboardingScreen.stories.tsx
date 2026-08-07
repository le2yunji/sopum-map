import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { OnboardingScreen } from "./OnboardingScreen";

const meta = {
  title: "Pages/Onboarding",
  component: OnboardingScreen,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof OnboardingScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "소품지도" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", { name: "시작하기" }),
    ).toHaveAttribute("href", "/login");
    await expect(
      canvas.getByRole("link", { name: "로그인하기" }),
    ).toHaveAttribute("href", "/login");
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
