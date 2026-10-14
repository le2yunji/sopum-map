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
    const toggle = canvas.getByRole("button", { name: "모든 태그 보기" });

    await expect(canvas.getByText("방문 경험")).toBeVisible();
    await expect(canvas.getByText("쇼핑 목적")).toBeVisible();
    await expect(canvas.queryByText("분위기")).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "사진 남기기 좋아요" }),
    ).not.toBePressed();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(
      canvas.getByText("태그를 1개 이상 선택해 주세요."),
    ).toHaveAttribute("id", "visit-log-tags-error");

    await userEvent.click(
      canvas.getByRole("button", { name: "사진 남기기 좋아요" }),
    );
    await userEvent.click(toggle);

    await expect(canvas.getByText("분위기")).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(
      canvas.getByRole("button", { name: "사진 남기기 좋아요" }),
    ).toBePressed();

    for (const label of [
      "아기자기한 소품이 많아요",
      "빈티지한 소품이 많아요",
      "포근한 감성이에요",
      "힙한 소품이 많아요",
    ]) {
      await userEvent.click(canvas.getByRole("button", { name: label }));
    }

    await expect(
      canvas.getByRole("button", { name: "러블리한 소품이 많아요" }),
    ).toBeDisabled();

    await userEvent.click(
      canvas.getByRole("button", { name: "선택한 태그 사진 남기기 좋아요 삭제" }),
    );
    await expect(
      canvas.getByRole("button", { name: "러블리한 소품이 많아요" }),
    ).toBeEnabled();

    await userEvent.click(
      canvas.getByRole("button", { name: "기본 태그만 보기" }),
    );
    await expect(canvas.queryByText("분위기")).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: "선택한 태그 아기자기한 소품이 많아요 삭제",
      }),
    ).toBeVisible();
  },
};
