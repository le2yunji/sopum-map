import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { MAP_SHOPS } from "../_data/map.fixture";
import { MapScreen } from "./MapScreen";

const TestMap = () => <div aria-label="네이버 지도" className="absolute inset-0 bg-green-50" />;

const meta = {
  title: "Pages/MapScreen",
  component: MapScreen,
  parameters: { layout: "fullscreen" },
  args: {
    shops: MAP_SHOPS,
    mapSlot: () => <TestMap />,
  },
} satisfies Meta<typeof MapScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("네이버 지도")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "지도 나가기" })).toHaveAttribute("href", "/");
    await expect(canvasElement.querySelectorAll("dialog")).toHaveLength(1);
    await expect(canvas.getByRole("searchbox", { name: "상점 이름 검색" })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: /가챠가챠/ })).toHaveAttribute("href", "/shops/gachagacha");
    await userEvent.click(canvas.getByRole("button", { name: "홍대·연남" }));
    await expect(canvas.getByRole("link", { name: /럭키 클로버/ })).toBeInTheDocument();
    await expect(canvas.queryByRole("link", { name: /모모네 소품샵/ })).not.toBeInTheDocument();
  },
};

export const SearchEmpty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "상점 이름 검색" }), "없는 상점");
    await expect(canvas.getByText("조건에 맞는 상점이 없어요")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "필터 초기화" }));
    await expect(canvas.getByRole("link", { name: /모모네 소품샵/ })).toBeInTheDocument();
  },
};

export const TagFilterSheet: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "상세 필터 열기" }));
    const dialog = canvas.getByRole("dialog", { name: "태그 필터" });
    await userEvent.click(within(dialog).getByRole("button", { name: "# 문구" }));
    await expect(within(dialog).getByRole("button", { name: "1개 태그 적용" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("dialog", { name: "태그 필터" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "상세 필터 열기" })).toHaveFocus();
  },
};

export const EmptyData: Story = {
  args: { shops: [], mapSlot: () => <TestMap /> },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("조건에 맞는 상점이 없어요")).toBeInTheDocument();
  },
};
