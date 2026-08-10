"use client";

import { forwardRef, useId } from "react";

import type { TextareaProps } from "./Textarea.types";

/** 소비자 설명과 컴포넌트 피드백을 하나의 접근 가능한 연결로 합칩니다. */
function joinDescriptionIds(
  describedBy: string | undefined,
  feedbackId: string | undefined,
) {
  return [describedBy, feedbackId].filter(Boolean).join(" ") || undefined;
}

/** 여러 줄 제어 입력과 label, 피드백, 글자 수를 함께 제공합니다. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      value,
      onChange,
      label,
      helperText,
      errorMessage,
      showCharacterCount = false,
      maxLength,
      id,
      className = "",
      textareaClassName = "",
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...textareaProps
    },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const feedbackText = errorMessage ?? helperText;
    const feedbackId = feedbackText ? `${textareaId}-feedback` : undefined;
    const describedBy = joinDescriptionIds(ariaDescribedBy, feedbackId);
    const countText = maxLength
      ? `${value.length} / ${maxLength}`
      : String(value.length);

    return (
      <div className={["w-full", className].join(" ")}>
        {label ? (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-14 font-semibold text-black-950"
          >
            {label}
          </label>
        ) : null}

        <textarea
          {...textareaProps}
          ref={ref}
          id={textareaId}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          aria-describedby={describedBy}
          aria-invalid={errorMessage ? true : ariaInvalid}
          className={[
            "min-h-32 w-full resize-none rounded-xl border border-black-300 bg-white px-4 py-3",
            "text-14 leading-6 text-black-950 outline-none placeholder:text-black-400",
            "disabled:cursor-not-allowed disabled:bg-black-100 disabled:text-black-400",
            "read-only:bg-black-100 read-only:text-black-800",
            errorMessage
              ? "border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-400/20"
              : "focus:border-green-500 focus:ring-2 focus:ring-green-500/20",
            textareaClassName,
          ].join(" ")}
        />

        {feedbackText || showCharacterCount ? (
          <div className="mt-2 flex items-start justify-between gap-3 text-12 text-black-500">
            {feedbackText ? (
              <p id={feedbackId} className={errorMessage ? "text-red-600" : ""}>
                {feedbackText}
              </p>
            ) : (
              <span />
            )}
            {showCharacterCount ? (
              <span className="ml-auto shrink-0">{countText}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
