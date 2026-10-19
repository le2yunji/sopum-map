import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { TagKey } from "@sopum-map/shared";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { MapFilterSheet } from "./MapFilterSheet";

const meta = {
  title: "Pages/Map/MapFilterSheet",
  component: MapFilterSheet,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    selectedTagKeys: [],
    onToggleTag: () => undefined,
    onClose: () => undefined,
  },
} satisfies Meta<typeof MapFilterSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 지도 필터가 안내 문구 없이 분류별 태그 목록을 제공합니다. */
function StatefulMapFilterSheet() {
  const [selectedTagKeys, setSelectedTagKeys] = useState<readonly TagKey[]>([]);

  /** 선택한 태그를 추가하거나 제거합니다. */
  const toggleTag = (tagKey: TagKey) => {
    setSelectedTagKeys((current) =>
      current.includes(tagKey)
        ? current.filter((selectedKey) => selectedKey !== tagKey)
        : [...current, tagKey],
    );
  };

  return (
    <MapFilterSheet
      open
      selectedTagKeys={selectedTagKeys}
      onToggleTag={toggleTag}
      onClose={() => undefined}
    />
  );
}

export const Default: Story = {
  render: () => <StatefulMapFilterSheet />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("소품")).toBeVisible();
    await expect(canvas.getByText("분위기")).toBeVisible();
    await expect(canvas.getByText("방문 경험")).toBeVisible();
    await expect(
      canvas.queryByText("기억에 남는 상품이나 캐릭터를 선택해 주세요."),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "키링" }));

    await expect(canvas.getByRole("button", { name: "키링" })).toBePressed();
    await expect(canvas.getByRole("button", { name: "1개 태그 적용" })).toBeVisible();
  },
};
