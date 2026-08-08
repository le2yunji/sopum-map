import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";

import { MAP_SHOPS } from "../_data/map.fixture";
import { NaverMapCanvas } from "./NaverMapCanvas";

const meta = {
  title: "Pages/MapScreen/NaverMapCanvas",
  component: NaverMapCanvas,
  decorators: [(Story) => <div className="relative h-[600px]"><Story /></div>],
  args: { shops: MAP_SHOPS, onSelectShop: fn() },
} satisfies Meta<typeof NaverMapCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MissingClientId: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("Client ID 설정이 필요함");
  },
};
