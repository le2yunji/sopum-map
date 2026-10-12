import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { CourseEditor } from "./CourseEditor";

const shops = [
  {
    id: "shop-1",
    name: "첫 번째 상점",
    address: "서울 성동구 성수동",
    mainImageUrl: null,
  },
  {
    id: "shop-2",
    name: "두 번째 상점",
    address: "서울 성동구 서울숲",
    mainImageUrl: null,
  },
] as const;

const meta = {
  title: "Pages/CourseEditor",
  component: CourseEditor,
  parameters: { layout: "fullscreen" },
  args: {
    heading: "코스 수정",
    initialTitle: "성수 소품 산책",
    initialDescription: "천천히 둘러보는 코스",
    initialIsPublic: true,
    initialStartShopId: "shop-1",
    initialSelectedShops: [
      { shopId: "shop-1", order: 1, memo: null },
      { shopId: "shop-2", order: 2, memo: null },
    ],
    shops,
    hasNextPage: false,
    isFetchingNextPage: false,
    isSubmitting: false,
    isOptimizing: false,
    submitLabel: "코스 수정하기",
    showVisibilityControl: true,
    onExit: fn(),
    onLoadMore: fn(),
    onOptimize: fn(async () => ["shop-2", "shop-1"]),
    onSubmit: fn(async () => undefined),
  },
} satisfies Meta<typeof CourseEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EditCourse: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const visibilitySwitch = canvas.getByRole("switch");

    await expect(
      canvas.getByRole("button", { name: "코스 수정 나가기" }),
    ).toBeVisible();
    await expect(visibilitySwitch).toBeChecked();
    await expect(
      canvas.getByRole("button", { name: "첫 방문" }),
    ).toBePressed();

    await userEvent.click(
      canvas.getByRole("button", { name: "추천 순서로 정렬" }),
    );
    await expect(args.onOptimize).toHaveBeenCalledWith(
      ["shop-1", "shop-2"],
      "shop-1",
    );
    await waitFor(() => {
      expect(
        canvas
          .getAllByText(/번째 상점/)
          .map((shopName) => shopName.textContent),
      ).toEqual(["두 번째 상점", "첫 번째 상점"]);
    });

    await userEvent.click(visibilitySwitch);
    await expect(visibilitySwitch).not.toBeChecked();
  },
};
