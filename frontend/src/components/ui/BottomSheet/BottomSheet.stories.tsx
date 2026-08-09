import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { BottomSheet } from "./BottomSheet";

/** 제어 상태로 BottomSheet의 실제 열기와 닫기 흐름을 제공합니다. */
function ControlledBottomSheetExample({
  closeOnBackdrop = true,
}: Readonly<{ closeOnBackdrop?: boolean }>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        바텀시트 열기
      </button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        ariaLabel="선택 메뉴"
        closeOnBackdrop={closeOnBackdrop}
      >
        <p data-testid="bottom-sheet-panel-content">선택 내용입니다.</p>
      </BottomSheet>
    </>
  );
}

const meta = {
  title: "Components/BottomSheet",
  component: BottomSheet,
  args: {
    open: false,
    onOpenChange: fn(),
    children: null,
    ariaLabel: "바텀시트",
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
  render: () => <ControlledBottomSheetExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "바텀시트 열기" });

    await expect(
      canvas.queryByRole("dialog", { name: "선택 메뉴" }),
    ).not.toBeInTheDocument();

    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog", { name: "선택 메뉴" });
    await expect(dialog).toBeVisible();
    await expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(dialog).not.toBeVisible();
      expect(trigger).toHaveFocus();
      expect(document.body.style.overflow).toBe("");
    });
  },
};

export const BackdropDismissal: Story = {
  render: () => <ControlledBottomSheetExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "바텀시트 열기" });

    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog", { name: "선택 메뉴" });

    await userEvent.click(canvas.getByTestId("bottom-sheet-panel-content"));
    await expect(dialog).toBeVisible();

    await userEvent.click(dialog);
    await waitFor(() => expect(dialog).not.toBeVisible());
  },
};

export const PersistentBackdrop: Story = {
  render: () => <ControlledBottomSheetExample closeOnBackdrop={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "바텀시트 열기" }),
    );
    const dialog = canvas.getByRole("dialog", { name: "선택 메뉴" });

    await userEvent.click(dialog);
    await expect(dialog).toBeVisible();
  },
};
