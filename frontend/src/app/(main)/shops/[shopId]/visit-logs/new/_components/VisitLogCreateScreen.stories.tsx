import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { VisitLogCreateForm } from "./VisitLogCreateScreen";

const shop = {
  id: "shop-1",
  name: "모모 소품샵",
  category: "소품샵",
  regionLabel: "성수·서울숲",
  mainImageUrl: "/images/shops/shop_example.png",
} as const;

const meta = {
  title: "Pages/VisitLogCreateScreen",
  component: VisitLogCreateForm,
  parameters: { layout: "fullscreen" },
  args: {
    shop,
    initialDateValue: "2026-10-14",
    isPending: false,
    onBack: fn(),
    onSubmit: fn(async () => undefined),
  },
} satisfies Meta<typeof VisitLogCreateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateVisitLog: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("모모 소품샵")).toBeVisible();
    await expect(canvas.getByLabelText("방문일")).toHaveValue("2026-10-14");

    await userEvent.click(canvas.getByRole("button", { name: "방문 로그 등록하기" }));
    await expect(
      canvas.getByText("태그를 1개 이상 선택해 주세요."),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "사진 남기기 좋아요" }),
    );
    await userEvent.type(
      canvas.getByLabelText("방문 메모"),
      "다시 가고 싶은 상점이에요.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "방문 로그 등록하기" }));

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith({
        visitedAt: "2026-10-14T03:00:00.000Z",
        selectedTagKeys: ["photo_spot"],
        content: "다시 가고 싶은 상점이에요.",
        imageKeys: [],
      });
    });
  },
};

export const Pending: Story = {
  args: { isPending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole("button", { name: "처리 중" });

    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toHaveAttribute("aria-busy", "true");
  },
};

export const ApiErrorKeepsDraft: Story = {
  args: {
    onSubmit: fn(async () => {
      throw new Error("방문 로그를 등록하지 못했어요.");
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const memo = canvas.getByLabelText("방문 메모");

    await userEvent.click(
      canvas.getByRole("button", { name: "사진 남기기 좋아요" }),
    );
    await userEvent.type(memo, "입력을 보존해 주세요.");
    await userEvent.click(canvas.getByRole("button", { name: "방문 로그 등록하기" }));

    await expect(
      await canvas.findByText("방문 로그를 등록하지 못했어요."),
    ).toBeVisible();
    await expect(memo).toHaveValue("입력을 보존해 주세요.");
  },
};

export const BackFallback: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "상점 상세로 돌아가기" }),
    );
    await expect(args.onBack).toHaveBeenCalledOnce();
  },
};
