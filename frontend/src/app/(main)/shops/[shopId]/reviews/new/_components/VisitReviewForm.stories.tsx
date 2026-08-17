import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { VisitReviewForm } from "./VisitReviewForm";

const meta = {
  title: "Pages/VisitReviewForm",
  component: VisitReviewForm,
  parameters: { layout: "fullscreen" },
  args: {
    shopId: "shop-1",
    shopName: "모모 소품샵",
    onSubmit: fn(),
  },
} satisfies Meta<typeof VisitReviewForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "후기 작성" }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("모모 소품샵")).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "아기자기해요" }),
    );
    await userEvent.type(
      canvas.getByRole("textbox", { name: "후기" }),
      "작고 귀여운 소품이 많아 즐거웠어요.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "후기 등록하기" }));

    await expect(args.onSubmit).toHaveBeenCalledWith({
      tags: ["아기자기해요"],
      review: "작고 귀여운 소품이 많아 즐거웠어요.",
      images: [],
    });
  },
};

export const Validation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "후기 등록하기" }));
    await expect(canvas.getByText("태그를 1개 이상 선택해 주세요.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "미니멀" })).toHaveFocus();
  },
};

export const TagLimit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tags = [
      "미니멀",
      "인테리어 소품이 많아요",
      "아기자기해요",
      "선물 사기 좋아요",
      "캐릭터 상품이 많아요",
    ];

    for (const tag of tags) {
      await userEvent.click(canvas.getByRole("button", { name: tag }));
    }

    await expect(canvas.getByText("태그 5/5")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "빈티지해요" }),
    ).toBeDisabled();
  },
};

export const ImagePreview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("사진 추가");
    const image = new File(["image"], "visit.png", { type: "image/png" });

    await userEvent.upload(input, image);
    await expect(canvas.getByText("사진 1/5")).toBeVisible();
    await expect(
      canvas.getByRole("img", { name: "visit.png 미리보기" }),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "visit.png 삭제" }),
    );
    await expect(canvas.getByText("사진 0/5")).toBeVisible();
  },
};

export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: "후기 작성 화면을 불러오는 중",
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
