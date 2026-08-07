import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BottomNavigation } from "./BottomNavigation";

const meta = {
  title: "Components/Navigation/BottomNavigation",
  component: BottomNavigation,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    currentPath: "/",
  },
} satisfies Meta<typeof BottomNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HomeActive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", { name: "주요 메뉴" });

    await expect(
      within(navigation).getByRole("link", { name: "홈" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      within(navigation).getByRole("link", { name: "지도" }),
    ).toHaveAttribute("href", "/map");
    await expect(
      within(navigation).getByRole("link", { name: "내 픽" }),
    ).toHaveAttribute("href", "/picks");
    await expect(
      within(navigation).getByRole("link", { name: "마이페이지" }),
    ).toHaveAttribute("href", "/me");
  },
};
