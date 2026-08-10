import type {
  ChangeEventHandler,
  TextareaHTMLAttributes,
} from "react";

export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "className"
> &
  Readonly<{
    value: string;
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
    label?: string;
    helperText?: string;
    errorMessage?: string;
    showCharacterCount?: boolean;
    className?: string;
    textareaClassName?: string;
  }>;
