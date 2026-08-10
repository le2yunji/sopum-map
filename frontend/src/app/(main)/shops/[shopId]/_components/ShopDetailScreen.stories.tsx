import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";

import { SHOP_DETAIL_FIXTURE } from "../_data/shop-detail.fixture";
import { ShopDetailScreen } from "./ShopDetailScreen";

const meta = {
  title: "Screens/ShopDetail",
  component: ShopDetailScreen,
  args: {
    shop: SHOP_DETAIL_FIXTURE,
    state: "success",
    onRetry: fn(),
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ShopDetailScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { level: 1, name: "행운상점 연남" }),
    ).toBeVisible();
    await expect(canvas.getByText("소품샵")).toBeVisible();
    await expect(canvas.getByText("#빈티지")).toBeVisible();
    await expect(canvas.getByText("서울 마포구 동교로 123")).toBeVisible();
    await expect(canvas.getByText("매일 12:00 - 20:00")).toBeVisible();
    await expect(canvas.getByText("02-1234-5678")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "인스타그램 열기" }),
    ).toHaveAttribute("href", "https://www.instagram.com/sopummap");
    await expect(
      canvas.getByRole("link", { name: "네이버 지도에서 보기" }),
    ).toHaveAttribute("href", "https://map.naver.com");
    await expect(canvas.getByText("연남동 산책 중 발견했어요.")).toBeVisible();
    await expect(canvas.getByText("선물 고르기 좋은 곳이에요.")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "방문 후기 작성" }),
    ).toHaveAttribute("href", "/shops/shop-1/reviews/new");
  },
};

export const Loading: Story = {
  args: { state: "loading" },
};

export const Empty: Story = {
  args: { shop: undefined },
};

export const Error: Story = {
  args: { state: "error" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "상점 정보를 불러오지 못했어요" }),
    ).toBeVisible();
    canvas.getByRole("button", { name: "다시 시도" }).click();
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};
