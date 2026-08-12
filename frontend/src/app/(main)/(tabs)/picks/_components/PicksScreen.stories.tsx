import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { PicksScreen } from "./PicksScreen";

const meta = {
  title: "Pages/Picks",
  component: PicksScreen,
  parameters: { layout: "fullscreen" },
  args: { onCreateCourse: fn() },
} satisfies Meta<typeof PicksScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("heading", { name: "내 픽" })).toBeVisible();
    await expect(canvas.getByText("Sunny 소품샵")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "가고 싶은 곳 3" }));
    await expect(canvas.getByText("해피해피샵")).toBeVisible();
    await expect(canvas.getByText("메모 · 주말 오후에 들러보기")).toBeVisible();
    await expect(canvas.queryByText("가챠가챠")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "폴더 작업 열기" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "이 폴더 속 샵으로 코스 만들기" }),
    );
    await expect(args.onCreateCourse).toHaveBeenCalledWith("가고 싶은 곳");
  },
};

export const AddFolder: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "폴더 작업 열기" }),
    );
    await expect(
      canvas.getByRole("button", { name: "이 폴더 속 샵으로 코스 만들기" }),
    ).toHaveFocus();
    await userEvent.click(
      canvas.getByRole("button", { name: "새로운 폴더 추가하기" }),
    );
    await userEvent.type(
      canvas.getByRole("textbox", { name: "새 폴더 이름" }),
      "주말 나들이",
    );
    await userEvent.click(canvas.getByRole("button", { name: "폴더 만들기" }));
    await expect(
      canvas.getByRole("button", { name: "주말 나들이 0" }),
    ).toBeVisible();
  },
};

export const DuplicateFolder: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "폴더 작업 열기" }));
    await userEvent.click(canvas.getByRole("button", { name: "새로운 폴더 추가하기" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "새 폴더 이름" }), "좋아요");
    await expect(canvas.getByText("이미 사용 중인 폴더 이름이에요.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "폴더 만들기" })).toBeDisabled();
  },
};

export const Empty: Story = {
  args: { initialShops: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("아직 이 폴더에 담긴 상점이 없어요"),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: "내 픽을 불러오는 중",
      }),
    ).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: { state: "error", onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "다시 시도" }),
    );
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};
