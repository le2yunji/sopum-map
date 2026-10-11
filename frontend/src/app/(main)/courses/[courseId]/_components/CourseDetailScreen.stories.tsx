import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { expect, within } from "storybook/test";

import { CourseDetailScreen } from "./CourseDetailScreen";

const meta = {
  title: "Pages/CourseDetail",
  component: CourseDetailScreen,

  parameters: {
    layout: "fullscreen",
  },

  args: {
    courseId: "seoul-forest-postcard",
  },
} satisfies Meta<typeof CourseDetailScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Render: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("status", {
        name: "코스를 불러오는 중",
      }),
    ).toBeVisible();
  },
};
