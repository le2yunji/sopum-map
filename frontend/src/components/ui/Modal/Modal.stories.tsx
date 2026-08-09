import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Modal } from "./Modal";

/** 제어 상태로 Modal을 열고 닫는 실제 사용 흐름을 제공합니다. */
function ControlledModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        모달 열기
      </button>
      <Modal open={open} onOpenChange={setOpen} ariaLabel="알림">
        <p>안내 내용입니다.</p>
      </Modal>
    </>
  );
}

const meta = {
  title: "Components/Modal",
  component: Modal,
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
  },
};
