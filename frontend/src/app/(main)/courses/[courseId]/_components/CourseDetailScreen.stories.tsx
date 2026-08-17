import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { CourseDetailScreen } from "./CourseDetailScreen";

const meta = {
  title: "Pages/CourseDetail",
  component: CourseDetailScreen,
  parameters: { layout: "fullscreen" },
  args: { onDelete: fn() },
} satisfies Meta<typeof CourseDetailScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("heading", { name: "서울숲 엽서 투어" })).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.getByRole("link", { name: "온더데스크 상세보기" })).toHaveAttribute("href", "/shops/on-the-desk");
    await expect(canvas.getByRole("link", { name: "네이버지도에서 코스 보기" })).toHaveAttribute("href", expect.stringContaining("map.naver.com"));
  },
};

export const OwnerActions: Story = {
  args: { isOwner: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("link", { name: "수정" })).toHaveAttribute("href", "/courses/seoul-forest-postcard/edit");
    await userEvent.click(canvas.getByRole("button", { name: "코스 삭제" }));
    await expect(canvas.getByText("이 코스를 삭제하시겠어요?")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "삭제 확인" }));
    await expect(args.onDelete).toHaveBeenCalledOnce();
  },
};

export const Empty: Story = {
  args: { shops: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("아직 코스에 담긴 상점이 없습니다.")).toBeVisible();
  },
};

export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status", { name: "코스를 불러오는 중" })).toBeVisible();
  },
};

export const Error: Story = {
  args: { state: "error", onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "다시 시도" }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};
