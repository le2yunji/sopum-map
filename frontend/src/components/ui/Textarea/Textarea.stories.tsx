import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Textarea } from "./Textarea";

/** 실제 부모 컴포넌트처럼 Textarea 값을 제어합니다. */
function ControlledTextareaExample() {
  const [value, setValue] = useState("");

  return (
    <Textarea
      value={value}
      onChange={(event) => setValue(event.target.value)}
      label="방문 후기"
      placeholder="매장에서 발견한 행운을 남겨 주세요."
      maxLength={20}
      showCharacterCount
    />
  );
}

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
  render: () => <ControlledTextareaExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "방문 후기" });

    await userEvent.click(canvas.getByText("방문 후기"));
    await expect(textarea).toHaveFocus();

    await userEvent.type(textarea, "행운을 발견했어요");
    await expect(textarea).toHaveValue("행운을 발견했어요");
    await expect(canvas.getByText("9 / 20")).toBeVisible();
  },
};
