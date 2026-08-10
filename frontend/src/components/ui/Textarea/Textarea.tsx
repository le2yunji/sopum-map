"use client";

import { useId } from "react";
import type { TextareaProps } from "./Textarea.types";

/**
 * 여러 줄 텍스트 입력을 위한 제어형 Textarea 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * <Textarea
 *   value={description}
 *   onChange={(event) => setDescription(event.target.value)}
 *   label="매장 설명"
 *   maxLength={200}
 *   showCharacterCount
 *   textareaClassName="h-32"
 * />
 * ```
 */

export const Textarea = ({
  ref,
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
}: TextareaProps) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  const feedbackText = errorMessage ?? helperText;
  const feedbackId = feedbackText ? `${textareaId}-feedback` : undefined;

  // 외부 설명과 helper/error 메시지를 aria-describedby로 함께 연결
  const descriptionIds = [ariaDescribedBy, feedbackId].filter(Boolean);

  const ariaDescribedByValue =
    descriptionIds.length > 0 ? descriptionIds.join(" ") : undefined;

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
        aria-describedby={ariaDescribedByValue}
        aria-invalid={errorMessage ? true : ariaInvalid}
        className={[
          "w-full resize-none overflow-y-auto rounded-xl border border-gray-200 bg-white px-4 py-3",
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
};
