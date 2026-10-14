import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { TagKey } from "@sopum-map/shared";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { VisitLogTagSelector } from "./VisitLogTagSelector";

const meta = {
  title: "Pages/VisitLogTagSelector",
  component: VisitLogTagSelector,
  parameters: { layout: "padded" },
  args: {
    selectedTagKeys: [],
    onChange: () => undefined,
  },
} satisfies Meta<typeof VisitLogTagSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 실제 작성 화면처럼 선택 상태를 유지하는 태그 선택 예시입니다. */
function StatefulTagSelector() {
  const [selectedTagKeys, setSelectedTagKeys] = useState<readonly TagKey[]>([]);

  return (
    <VisitLogTagSelector
      selectedTagKeys={selectedTagKeys}
      onChange={setSelectedTagKeys}
      errorMessage="태그를 1개 이상 선택해 주세요."
    />
  );
}

export const Default: Story = {
  render: () => <StatefulTagSelector />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("소품")).toBeVisible();
    await expect(canvas.getByText("분위기")).toBeVisible();
    await expect(canvas.getByText("방문 경험")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "키링" }),
    ).not.toBePressed();
    await expect(
      canvas.getByText("태그를 1개 이상 선택해 주세요."),
    ).toHaveAttribute("id", "visit-log-tags-error");

    for (const label of [
      "키링",
      "스티커",
      "다꾸템",
      "인형",
      "피규어",
    ]) {
      await userEvent.click(canvas.getByRole("button", { name: label }));
    }

    await expect(
      canvas.getByRole("button", { name: "가챠" }),
    ).toBeDisabled();

    await userEvent.click(
      canvas.getByRole("button", { name: "선택한 태그 키링 삭제" }),
    );
    await expect(
      canvas.getByRole("button", { name: "가챠" }),
    ).toBeEnabled();
    await expect(
      canvas.queryByRole("button", { name: "선택한 태그 키링 삭제" }),
    ).not.toBeInTheDocument();
  },
};
