import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { MyPageScreen } from "./MyPageScreen";

const meta = {
  title: "Pages/MyPage",
  component: MyPageScreen,
  parameters: { layout: "fullscreen" },
  args: { onLogout: fn() },
} satisfies Meta<typeof MyPageScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "마이페이지" })).toBeVisible();
    await expect(canvas.getByText("소품 수집가")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "좋아요한 매장 8개 보기" })).toHaveAttribute("href", "/picks?folder=likes");
    await expect(canvas.getByRole("link", { name: "내 픽 12개 보기" })).toHaveAttribute("href", "/picks");
    await expect(canvas.getByRole("link", { name: "내 코스 3개 보기" })).toHaveAttribute("href", "/me/courses");
  },
};

export const ProfileEdit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "프로필 수정" }));
    const nickname = canvas.getByRole("textbox", { name: "닉네임" });
    await userEvent.clear(nickname);
    await userEvent.type(nickname, "행운 수집가");
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    await expect(canvas.getByText("행운 수집가")).toBeVisible();
    await expect(canvas.getByText("프로필이 저장되었습니다.")).toBeVisible();
  },
};

export const Logout: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "로그아웃" }));
    await expect(canvas.getByText("로그아웃하시겠어요?")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "로그아웃 확인" }));
    await expect(args.onLogout).toHaveBeenCalledOnce();
  },
};

export const LoggedOut: Story = {
  args: { isLoggedIn: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("로그인하고 취향 기록을 모아보세요.")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
  },
};

export const Empty: Story = {
  args: { isEmpty: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("아직 모아둔 취향 기록이 없습니다.")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "상점 둘러보기" })).toHaveAttribute("href", "/map");
  },
};

export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status", { name: "마이페이지를 불러오는 중" })).toBeVisible();
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
