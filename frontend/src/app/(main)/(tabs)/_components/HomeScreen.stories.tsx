import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { HOME_DATA } from "../_data/home.fixture";
import { HomeScreen } from "./HomeScreen";

const meta = {
  title: "Pages/Home",
  component: HomeScreen,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    data: HOME_DATA,
  },
} satisfies Meta<typeof HomeScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "오늘의 행운을 찾아서 🍀" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("group", { name: "상점 카테고리" }),
    ).toBeInTheDocument();
    const categorySection = canvas.getByRole("region", { name: "카테고리" });
    await expect(
      within(categorySection).getByRole("heading", {
        name: "모모네 소품샵",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", { name: "망원동 소품샵 투어 코스 상세 보기" }),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "문구" }));
    await expect(
      within(categorySection).getByRole("heading", { name: "페이지 메이트" }),
    ).toBeInTheDocument();
    await expect(
      within(categorySection).queryByRole("heading", {
        name: "모모네 소품샵",
      }),
    ).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: {
    state: "loading",
  },
};

export const Empty: Story = {
  args: {
    state: "empty",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("아직 소개할 소품샵이 없어요"),
    ).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: {
    state: "error",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "다시 시도" }),
    ).toBeInTheDocument();
  },
};
