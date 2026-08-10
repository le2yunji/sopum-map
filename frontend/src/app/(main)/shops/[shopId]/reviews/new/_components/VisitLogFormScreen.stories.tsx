import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { VisitLogFormScreen } from "./VisitLogFormScreen";

const meta = {
  title: "Screens/VisitLogForm",
  component: VisitLogFormScreen,
  args: {
    shopId: "shop-1",
    shopName: "행운상점 연남",
    onSubmit: fn(),
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof VisitLogFormScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("heading", { name: "방문 후기 작성" })).toBeVisible();
    await expect(canvas.getByText("행운상점 연남")).toBeVisible();
    await userEvent.type(canvas.getByLabelText(/^방문일/), "2026-08-09");
    await userEvent.click(canvas.getByRole("button", { name: "친절해요" }));
    await userEvent.type(canvas.getByLabelText("한 줄 후기"), "천천히 구경하기 좋았어요.");
    const imageBlob = await fetch("/images/shops/shop_example.png").then(
      (response) => response.blob(),
    );
    await userEvent.upload(
      canvas.getByLabelText("사진 첨부"),
      new File([imageBlob], "visit.png", { type: "image/png" }),
    );
    await expect(canvas.getByRole("img", { name: "visit.png 미리보기" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "작성 완료" }));
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const Validation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "작성 완료" }));
    await expect(canvas.getByText("방문일을 선택해 주세요.")).toBeVisible();
    await expect(canvas.getByText("방문 태그를 하나 이상 선택해 주세요.")).toBeVisible();
    await expect(canvas.getByText("한 줄 후기를 입력해 주세요.")).toBeVisible();
    await expect(canvas.getByLabelText(/^방문일/)).toHaveFocus();
  },
};

export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error", onRetry: fn() } };
