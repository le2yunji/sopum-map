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

/** 지도 필터가 방문 로그와 같은 질문별 태그 목록을 제공합니다. */
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

    await expect(canvas.getByText("어떤 소품이 있었나요?")).toBeVisible();
    await expect(canvas.getByText("어떤 분위기였나요?")).toBeVisible();
    await expect(canvas.getByText("방문 경험은 어땠나요?")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "키링" }));

    await expect(canvas.getByRole("button", { name: "키링" })).toBePressed();
    await expect(canvas.getByRole("button", { name: "1개 태그 적용" })).toBeVisible();
  },
};
