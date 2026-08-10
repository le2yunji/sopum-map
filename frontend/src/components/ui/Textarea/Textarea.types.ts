import type { ChangeEventHandler, ComponentPropsWithRef } from "react";

export type TextareaProps = Omit<
  ComponentPropsWithRef<"textarea">,
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
