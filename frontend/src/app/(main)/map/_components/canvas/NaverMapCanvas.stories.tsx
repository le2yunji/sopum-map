import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";

import { MAP_SHOPS } from "../../_data/map.fixture";
import { NaverMapCanvas } from "./NaverMapCanvas";

const meta = {
  title: "Pages/MapScreen/NaverMapCanvas",
  component: NaverMapCanvas,
  decorators: [
    (Story) => (
      <div className="relative h-[600px]">
        <Story />
      </div>
    ),
  ],
  args: { shops: MAP_SHOPS, onSelectShop: fn() },
} satisfies Meta<typeof NaverMapCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MissingClientId: Story = {
  args: { stateOverride: "missing-key" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(
      "Client ID 설정이 필요해요",
    );
  },
};

export const Loading: Story = {
  args: { stateOverride: "loading" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", { name: "지도를 불러오는 중" }),
    ).toBeInTheDocument();
  },
};

export const LoadFailure: Story = {
  args: { stateOverride: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "지도 연결에 실패했어요",
    );
    await expect(
      canvas.getByRole("button", { name: "다시 시도" }),
    ).toBeInTheDocument();
  },
};
