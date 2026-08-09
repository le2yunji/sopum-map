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

/** 상점 정보 수정 제보 사유를 고르는 실제 바텀시트 흐름을 제공합니다. */
function ReportReasonBottomSheetExample() {
  const [open, setOpen] = useState(true);

  return (
    <BottomSheet
      open={open}
      onOpenChange={setOpen}
      ariaLabelledBy="report-reason-title"
      showCloseButton
      closeButtonLabel="제보 사유 닫기"
    >
      <BottomSheet.Handle />
      <BottomSheet.Header>
        <BottomSheet.Title id="report-reason-title">
          어떤 정보가 잘못되었나요?
        </BottomSheet.Title>
      </BottomSheet.Header>
      <BottomSheet.Body>
        <fieldset className="space-y-3">
          <legend className="sr-only">수정할 정보 선택</legend>
          {["주소가 달라요", "영업시간이 달라요", "폐점한 매장이에요"].map(
            (reason) => (
              <label key={reason} className="flex min-h-11 items-center gap-3">
                <input type="radio" name="report-reason" value={reason} />
                <span>{reason}</span>
              </label>
            ),
          )}
        </fieldset>
      </BottomSheet.Body>
      <BottomSheet.Footer>
        <button
          type="button"
          className="h-12 w-full rounded-xl bg-green-500 text-14 font-semibold text-white"
        >
          다음
        </button>
      </BottomSheet.Footer>
    </BottomSheet>
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

export const ReportReason: Story = {
  render: () => <ReportReasonBottomSheetExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole("dialog", {
      name: "어떤 정보가 잘못되었나요?",
    });

    await expect(dialog).toBeVisible();
    await expect(
      canvas.getByRole("radio", { name: "영업시간이 달라요" }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "다음" })).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "제보 사유 닫기" }),
    );
    await waitFor(() => expect(dialog).not.toBeVisible());
  },
};
