import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from "storybook/test";

import { SHOP_DETAIL_FIXTURE } from "../_data/shop-detail.fixture";
import { ShopDetailScreen } from "./ShopDetail";

const meta = {
  title: "Pages/ShopDetail",
  component: ShopDetailScreen,
  parameters: { layout: "fullscreen" },
  args: { shop: SHOP_DETAIL_FIXTURE },
} satisfies Meta<typeof ShopDetailScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "모모 소품샵" }),
    ).toBeInTheDocument();
    await expect(canvas.getByText(/서울숲역 도보 5분/)).toBeInTheDocument();
    await expect(
      canvas.getByRole("region", { name: "상점 위치" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("heading", { name: "방문 정보" }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole("article")).toHaveLength(3);
    await expect(
      canvas.getByRole("link", { name: "방문 후기 작성" }),
    ).toHaveAttribute("href", "/shops/shop-1/reviews/new");
    for (const iconName of ["heart", "pen", "location", "comment", "store"]) {
      await expect(canvas.getByTestId(`${iconName}-icon`)).toHaveAttribute(
        "src",
        expect.stringContaining(`${iconName}.svg`),
      );
    }
  },
};

export const Interactions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const likeButton = canvas.getByRole("button", { name: "좋아요 추가" });

    await userEvent.click(likeButton);
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");
    await expect(likeButton).toHaveAccessibleName("좋아요 취소");

    await userEvent.click(canvas.getByRole("button", { name: "다음 이미지" }));
    await expect(canvas.getByText("2 / 4")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "내 픽에 추가" }));
    await userEvent.click(canvas.getByRole("radio", { name: "성수 나들이" }));
    await userEvent.click(canvas.getByRole("button", { name: "폴더에 담기" }));
    await expect(canvas.getByText("성수 나들이에 담았어요")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "정보 수정 제보" }),
    );
    await userEvent.click(
      canvas.getByRole("radio", { name: "영업시간이 달라요" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "제보하기" }));
    await expect(
      canvas.getByRole("status", { name: "제보가 접수되었어요" }),
    ).toHaveTextContent("제보가 접수되었어요");
    await userEvent.click(canvas.getByRole("button", { name: "닫기" }));
    await waitFor(() =>
      expect(
        canvas.queryByRole("dialog", { name: "정보 수정 제보" }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: "상점 정보를 불러오는 중",
      }),
    ).toBeInTheDocument();
  },
};

export const EmptyReviews: Story = {
  args: {
    shop: { ...SHOP_DETAIL_FIXTURE, reviews: [] },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("아직 등록된 방문 후기가 없어요"),
    ).toBeInTheDocument();
  },
};

export const MissingImages: Story = {
  args: {
    shop: { ...SHOP_DETAIL_FIXTURE, imageUrls: [], mapImageUrl: undefined },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("img", { name: "모모 소품샵 매장 전경" }),
    ).toHaveAttribute("src", expect.stringContaining("shop_default.webp"));
    await expect(canvas.getByText("1 / 1")).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: { state: "error", onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const retryButton = within(canvasElement).getByRole("button", {
      name: "다시 시도",
    });

    await userEvent.click(retryButton);
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

export const BrokenImages: Story = {
  args: {
    shop: {
      ...SHOP_DETAIL_FIXTURE,
      imageUrls: ["/images/shops/missing.png"],
    },
  },
  play: async ({ canvasElement }) => {
    const hero = within(canvasElement).getByRole("img", {
      name: "모모 소품샵 매장 전경",
    });

    await fireEvent.error(hero);
    await expect(hero).toHaveAttribute(
      "src",
      expect.stringContaining("shop_default.webp"),
    );
  },
};
