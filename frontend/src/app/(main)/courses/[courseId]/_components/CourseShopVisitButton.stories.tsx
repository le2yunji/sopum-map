import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { CourseShopVisitButton } from "./CourseShopVisitButton";

const meta = {
  title: "Pages/CourseDetail/CourseShopVisitButton",
  component: CourseShopVisitButton,
  args: {
    isVisited: false,
    isPending: false,
    onSetVisited: fn(async () => undefined),
    onUnsetVisited: fn(async () => undefined),
    onWriteLog: fn(),
    onError: fn(),
  },
} satisfies Meta<typeof CourseShopVisitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProposeVisitLog: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "방문했어요" }));
    await expect(canvas.getByRole("heading", { name: "방문 로그를 작성하시겠어요?" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "방문만 기록" }));
    await expect(meta.args.onSetVisited).toHaveBeenCalledOnce();
    await expect(meta.args.onWriteLog).not.toHaveBeenCalled();
  },
};

export const WriteLogAfterVisit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "방문했어요" }));
    await userEvent.click(canvas.getByRole("button", { name: "로그 작성하기" }));
    await expect(meta.args.onSetVisited).toHaveBeenCalled();
    await expect(meta.args.onWriteLog).toHaveBeenCalledOnce();
  },
};

export const UnsetVisited: Story = {
  args: { isVisited: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "방문 완료" });
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(button);
    await expect(meta.args.onUnsetVisited).toHaveBeenCalledOnce();
  },
};
