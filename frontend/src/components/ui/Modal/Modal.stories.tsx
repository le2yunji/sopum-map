import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Image from "next/image";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Modal } from "./Modal";

/** 제어 상태로 Modal을 열고 닫는 실제 사용 흐름을 제공합니다. */
function ControlledModalExample({
  closeOnBackdrop = true,
}: Readonly<{ closeOnBackdrop?: boolean }>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        모달 열기
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        ariaLabel="알림"
        closeOnBackdrop={closeOnBackdrop}
      >
        <p data-testid="modal-panel-content">안내 내용입니다.</p>
      </Modal>
    </>
  );
}

const meta = {
  title: "Components/Modal",
  component: Modal,
  args: {
    open: false,
    onOpenChange: fn(),
    children: null,
    ariaLabel: "모달",
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
  render: () => <ControlledModalExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole("dialog", { name: "알림" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: "모달 열기" }),
    );

    await expect(
      canvas.getByRole("dialog", { name: "알림" }),
    ).toBeVisible();

    await expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Escape}");

    await waitFor(() => {
      expect(
        canvas.queryByRole("dialog", { name: "알림" }),
      ).not.toBeInTheDocument();
      expect(
        canvas.getByRole("button", { name: "모달 열기" }),
      ).toHaveFocus();
      expect(document.body.style.overflow).toBe("");
    });

    await userEvent.click(
      canvas.getByRole("button", { name: "모달 열기" }),
    );
    await expect(
      canvas.getByRole("dialog", { name: "알림" }),
    ).toBeVisible();
  },
};

export const BackdropDismissal: Story = {
  render: () => <ControlledModalExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "모달 열기" });

    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog", { name: "알림" });

    await userEvent.click(canvas.getByTestId("modal-panel-content"));
    await expect(dialog).toBeVisible();

    await userEvent.click(dialog);
    await waitFor(() => {
      expect(dialog).not.toBeVisible();
      expect(trigger).toHaveFocus();
    });
  },
};

export const PersistentBackdrop: Story = {
  render: () => <ControlledModalExample closeOnBackdrop={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "모달 열기" }),
    );
    const dialog = canvas.getByRole("dialog", { name: "알림" });

    await userEvent.click(dialog);
    await expect(dialog).toBeVisible();
  },
};

export const ReportComplete: Story = {
  render: () => (
    <Modal
      open
      onOpenChange={fn()}
      ariaLabelledBy="report-complete-title"
    >
      <Modal.Header>
        <Image
          src="/images/modal/report-complete-mascot.png"
          alt="클로버를 든 다람쥐"
          width={71}
          height={71}
          priority
        />
        <Modal.Title id="report-complete-title">
          제보가 완료되었습니다
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        소중한 제보 감사합니다.
        <br />더 나은 서비스를 위해 빠르게 확인하겠습니다.
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="h-11 w-full rounded-[9px] bg-black-100 text-14 font-medium text-black-800"
        >
          닫기
        </button>
      </Modal.Footer>
    </Modal>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dialog = canvas.getByRole("dialog", {
      name: "제보가 완료되었습니다",
    });

    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveTextContent("소중한 제보 감사합니다.");
    await expect(
      canvas.getByRole("button", { name: "닫기" }),
    ).toBeInTheDocument();
  },
};
