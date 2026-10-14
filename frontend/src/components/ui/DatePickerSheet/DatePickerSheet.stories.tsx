import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { DatePickerSheet } from "./DatePickerSheet";

const meta = {
  title: "UI/DatePickerSheet",
  component: DatePickerSheet,
  parameters: { layout: "padded" },
  args: {
    label: "방문일",
    value: "2026-10-14",
    maxDateValue: "2026-10-14",
    onChange: () => undefined,
  },
} satisfies Meta<typeof DatePickerSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 실제 입력처럼 선택값을 유지하는 달력 예시입니다. */
function StatefulDatePicker() {
  const [value, setValue] = useState("2026-10-14");

  return (
    <DatePickerSheet
      label="방문일"
      value={value}
      maxDateValue="2026-10-14"
      onChange={setValue}
    />
  );
}

export const OpenCalendar: Story = {
  render: () => <StatefulDatePicker />,
  globals: { viewport: { value: "sopumSmall", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", {
        name: "방문일 선택, 2026년 10월 14일",
      }),
    );
    await expect(
      canvas.getByRole("heading", { name: "방문일 선택" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /2026년 10월 15일/ }),
    ).toBeDisabled();
    await expect(
      canvasElement.ownerDocument.documentElement.scrollWidth,
    ).toBeLessThanOrEqual(
      canvasElement.ownerDocument.defaultView?.innerWidth ?? 320,
    );
  },
};
