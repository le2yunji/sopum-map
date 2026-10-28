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
    isAvailabilityPending: false,
    isPending: false,
    onBack: fn(),
    onCheckAvailability: fn(async () => ({ canCreate: true })),
    onSubmit: fn(async () => undefined),
  },
} satisfies Meta<typeof VisitLogCreateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateVisitLog: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("모모 소품샵")).toBeVisible();
    const dateButton = canvas.getByRole("button", {
      name: "방문일 선택, 2026년 10월 14일",
    });
    await expect(dateButton).toHaveTextContent("2026. 10. 14.");

    await userEvent.click(dateButton);
    await expect(
      canvas.getByRole("heading", { name: "방문일 선택" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: /2026년 10월 13일/ }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "선택 완료" }));
    await expect(dateButton).toHaveTextContent("2026. 10. 13.");

    await userEvent.click(canvas.getByRole("button", { name: "다음 · 태그 선택" }));
    await userEvent.click(canvas.getByRole("button", { name: "다음 · 사진과 기록" }));
    await expect(
      canvas.getByText("태그를 1개 이상 선택해 주세요."),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "키링" }),
    ).toHaveFocus();

    await userEvent.keyboard(" ");
    await userEvent.click(canvas.getByRole("button", { name: "다음 · 사진과 기록" }));
    await expect(
      canvas.getByRole("heading", { name: "방문 로그 작성 가이드" }),
    ).toBeVisible();
    await expect(
      canvas.getByText(
        "나의 기록도 쌓이고, 다른 소품 수집가에게도 도움이 돼요.",
      ),
    ).toBeVisible();
    await userEvent.type(
      canvas.getByLabelText("방문 내용 (선택)"),
      "다시 가고 싶은 상점이에요.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "내 방문 로그에 기록하기" }));

    await waitFor(() => {
      expect(args.onSubmit).toHaveBeenCalledWith({
        visitedAt: "2026-10-13T03:00:00.000Z",
        selectedTagKeys: ["keyrings"],
        content: "다시 가고 싶은 상점이에요.",
        imageUploadIds: [],
      });
    });
  },
};

export const Pending: Story = {
  args: { isPending: true },
};

export const DuplicateDateStaysOnFirstStep: Story = {
  args: {
    onCheckAvailability: fn(async () => ({ canCreate: false })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "다음 · 태그 선택" }),
    );
    await expect(
      await canvas.findByText(
        "같은 날짜의 방문 로그가 이미 있어요. 다른 날짜를 선택해 주세요.",
      ),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "방문 로그 작성 · 1/3" }),
    ).toBeVisible();
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

    await userEvent.click(canvas.getByRole("button", { name: "다음 · 태그 선택" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "키링" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "다음 · 사진과 기록" }));
    const memo = canvas.getByLabelText("방문 내용 (선택)");
    await userEvent.type(memo, "입력을 보존해 주세요.");
    await userEvent.click(canvas.getByRole("button", { name: "내 방문 로그에 기록하기" }));

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

export const SmallMobile: Story = {
  globals: { viewport: { value: "sopumSmall", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("heading", { name: "방문 로그 작성 · 1/3" })).toBeVisible();
    await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.ownerDocument.defaultView?.innerWidth ?? 320,
    );
  },
};

export const LargeMobile: Story = {
  globals: { viewport: { value: "sopumLarge", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("heading", { name: "방문 로그 작성 · 1/3" })).toBeVisible();
    await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.ownerDocument.defaultView?.innerWidth ?? 480,
    );
  },
};
