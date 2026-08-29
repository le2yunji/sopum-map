import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { OnboardingCarousel } from "./OnboardingCarousel";

const meta = {
  title: "Pages/Onboarding/Guide",
  component: OnboardingCarousel,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onComplete: fn(),
  },
} satisfies Meta<typeof OnboardingCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CompleteFlow: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", {
        name: "취향에 맞는 소품샵을 발견해요",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "이전" }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "다음" }));
    await expect(
      canvas.getByRole("heading", {
        name: "마음에 드는 곳은 내 픽에 모아요",
      }),
    ).toHaveFocus();
    await expect(args.onComplete).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole("button", { name: "이전" }));
    await expect(
      canvas.getByRole("heading", {
        name: "취향에 맞는 소품샵을 발견해요",
      }),
    ).toHaveFocus();

    const guide = canvas.getByRole("main", {
      name: "소품지도 기능 안내",
    });
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: guide,
        coords: { clientX: 240, clientY: 200 },
      },
      {
        keys: "[/MouseLeft]",
        target: guide,
        coords: { clientX: 120, clientY: 200 },
      },
    ]);
    await expect(
      canvas.getByRole("heading", {
        name: "마음에 드는 곳은 내 픽에 모아요",
      }),
    ).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(
      canvas.getByRole("button", { name: "소품지도 시작하기" }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("4페이지 중 4페이지")).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: "소품지도 시작하기" }),
    );
    await expect(args.onComplete).toHaveBeenCalledOnce();
  },
};

export const SmallMobile: Story = {
  globals: {
    viewport: {
      value: "sopumSmall",
      isRotated: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const guide = canvas.getByRole("main", {
      name: "소품지도 기능 안내",
    });
    const navigation = canvas.getByRole("navigation", {
      name: "온보딩 페이지 이동",
    });
    const nextButton = canvas.getByRole("button", { name: "다음" });

    expect(nextButton.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      navigation.getBoundingClientRect().width - 1,
    );

    await userEvent.click(nextButton);

    const previousButton = canvas.getByRole("button", { name: "이전" });
    const guideBounds = guide.getBoundingClientRect();
    const previousBounds = previousButton.getBoundingClientRect();
    const nextBounds = canvas
      .getByRole("button", { name: "다음" })
      .getBoundingClientRect();

    await expect(previousButton).toBeInTheDocument();
    await expect(previousBounds.left).toBeGreaterThanOrEqual(guideBounds.left);
    await expect(nextBounds.right).toBeLessThanOrEqual(guideBounds.right);
  },
};

export const LargeMobile: Story = {
  globals: {
    viewport: {
      value: "sopumLarge",
      isRotated: false,
    },
  },
};
