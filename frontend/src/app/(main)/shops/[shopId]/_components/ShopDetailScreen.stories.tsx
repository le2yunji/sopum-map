import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

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

export const Interactions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "다음 이미지 보기" }),
    );
    await expect(
      canvas.getByRole("img", { name: "행운상점 연남의 매장 전경" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "이전 이미지 보기" }),
    );

    const likeButton = canvas.getByRole("button", { name: "찜하기" });
    await userEvent.click(likeButton);
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");
    await expect(likeButton).toHaveAccessibleName("찜 해제");

    await userEvent.click(
      canvas.getByRole("button", { name: "내 픽에 추가" }),
    );
    const pickDialog = canvas.getByRole("dialog", { name: "내 픽에 추가" });
    await expect(pickDialog).toBeVisible();
    await userEvent.click(
      within(pickDialog).getByRole("button", {
        name: "연남동 산책, 상점 4개",
      }),
    );
    await waitFor(() => expect(pickDialog).not.toBeVisible());
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "연남동 산책에 추가했어요.",
    );

    const reportTrigger = canvas.getAllByRole("button", {
      name: "상점 정보 수정 제보",
    })[0];
    await userEvent.click(reportTrigger);
    const reportDialog = canvas.getByRole("dialog", {
      name: "어떤 정보가 잘못되었나요?",
    });
    await userEvent.click(
      within(reportDialog).getByRole("radio", { name: "영업시간이 달라요" }),
    );
    await userEvent.click(
      within(reportDialog).getByRole("button", { name: "다음" }),
    );

    const completeDialog = canvas.getByRole("dialog", {
      name: "제보가 완료되었습니다",
    });
    await expect(completeDialog).toBeVisible();
    await userEvent.click(
      within(completeDialog).getByRole("button", { name: "닫기" }),
    );
    await waitFor(() => {
      expect(completeDialog).not.toBeVisible();
      expect(reportTrigger).toHaveFocus();
    });
  },
};
