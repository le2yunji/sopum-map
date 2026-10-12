import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import type { MapTagFilter } from "../_constants/map.constants";
import { MapFilterSheet } from "./MapFilterSheet";

/** 지도 태그 필터의 실제 선택 상태를 제공합니다. */
function MapFilterSheetExample() {
  const [selectedFilters, setSelectedFilters] = useState<MapTagFilter[]>([]);

  return (
    <MapFilterSheet
      open
      selectedFilters={selectedFilters}
      onToggleFilter={(filter) => {
        setSelectedFilters((current) =>
          current.some((selected) => selected.value === filter.value)
            ? current.filter((selected) => selected.value !== filter.value)
            : [...current, filter],
        );
      }}
      onClose={() => undefined}
    />
  );
}

const meta = {
  title: "Pages/Map/MapFilterSheet",
  component: MapFilterSheetExample,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MapFilterSheetExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GroupedTags: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "분위기" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "상품" }),
    ).toBeVisible();

    const cuteFilter = canvas.getByRole("button", { name: "#아기자기" });
    const stationeryFilter = canvas.getByRole("button", {
      name: "#문구 다양",
    });

    await expect(cuteFilter).not.toBePressed();
    await userEvent.click(cuteFilter);
    await expect(cuteFilter).toBePressed();
    await expect(cuteFilter).toHaveClass("bg-green-500");
    await expect(
      canvas.getByRole("button", { name: "1개 태그 적용" }).parentElement,
    ).toHaveClass("sticky");
    await expect(stationeryFilter).toBeVisible();
  },
};
