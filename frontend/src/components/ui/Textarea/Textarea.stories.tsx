import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Textarea } from "./Textarea";
import type { TextareaProps } from "./Textarea.types";

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

type InteractiveTextareaExampleProps = Pick<
  TextareaProps,
  "disabled" | "readOnly" | "maxLength"
>;

/** native 입력 제한 상태를 부모 제어 값과 함께 검증합니다. */
function InteractiveTextareaExample({
  disabled = false,
  readOnly = false,
  maxLength,
}: InteractiveTextareaExampleProps) {
  const [value, setValue] = useState("");

  return (
    <Textarea
      value={value}
      onChange={(event) => setValue(event.target.value)}
      label="후기 내용"
      disabled={disabled}
      readOnly={readOnly}
      maxLength={maxLength}
      showCharacterCount
    />
  );
}

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: {
    value: "",
    onChange: fn(),
    "aria-label": "후기",
  },
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

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: "방문 후기",
    "aria-label": undefined,
  },
};

export const Placeholder: Story = {
  args: {
    placeholder: "매장에서 발견한 행운을 남겨 주세요.",
  },
};

export const WithValue: Story = {
  args: {
    value: "작지만 따뜻한 소품이 가득했어요.",
  },
};

export const HelperText: Story = {
  args: {
    label: "방문 후기",
    helperText: "방문 경험을 자세히 남겨 주세요.",
    "aria-label": undefined,
  },
};

export const Error: Story = {
  args: {
    label: "후기 내용",
    helperText: "방문 경험을 자세히 남겨 주세요.",
    errorMessage: "입력 내용을 확인해 주세요.",
    "aria-label": undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "후기 내용" });

    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    await expect(textarea).toHaveAccessibleDescription(
      "입력 내용을 확인해 주세요.",
    );
    await expect(
      canvas.queryByText("방문 경험을 자세히 남겨 주세요."),
    ).not.toBeInTheDocument();
  },
};

export const CharacterCount: Story = {
  args: {
    value: "좋았어요",
    showCharacterCount: true,
  },
};

export const MaxLengthReached: Story = {
  args: {
    value: "12345",
    maxLength: 5,
    showCharacterCount: true,
  },
};

export const MaxLengthInput: Story = {
  render: () => <InteractiveTextareaExample maxLength={5} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "후기 내용" });

    await userEvent.type(textarea, "123456");
    await expect(textarea).toHaveValue("12345");
    await expect(canvas.getByText("5 / 5")).toBeVisible();
  },
};

export const Disabled: Story = {
  render: () => <InteractiveTextareaExample disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "후기 내용" });

    await expect(textarea).toBeDisabled();
    await userEvent.type(textarea, "입력되지 않아요");
    await expect(textarea).toHaveValue("");
  },
};

export const ReadOnly: Story = {
  render: () => <InteractiveTextareaExample readOnly />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "후기 내용" });

    await expect(textarea).toHaveAttribute("readonly");
    await userEvent.type(textarea, "입력되지 않아요");
    await expect(textarea).toHaveValue("");
  },
};

export const LongReview: Story = {
  args: {
    label: "방문 후기",
    value:
      "골목 안쪽에 숨어 있어 찾는 재미가 있었어요. 작은 문구와 빈티지 소품이 공간마다 정성스럽게 놓여 있었고, 천천히 둘러보며 제 취향에 맞는 엽서와 키링을 발견했어요.",
    maxLength: 300,
    showCharacterCount: true,
    "aria-label": undefined,
  },
};
