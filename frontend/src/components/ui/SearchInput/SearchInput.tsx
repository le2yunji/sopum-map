"use client";

import { CloseCircleIcon, LoadingIcon, SearchIcon } from "@/components/icons";
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";

type SearchInputSize = "small" | "medium" | "large";

type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "value" | "defaultValue" | "onChange"
> & {
  /** 제어 컴포넌트로 사용할 때의 검색어 */
  value?: string;

  /** 비제어 컴포넌트로 사용할 때의 초기 검색어 */
  defaultValue?: string;

  /** 검색어 변경 이벤트 */
  onValueChange?: (value: string) => void;

  /** Enter 입력 시 실행 */
  onSearch?: (value: string) => void;

  /** 검색어 초기화 시 실행 */
  onClear?: () => void;

  /** 입력창 크기 */
  size?: SearchInputSize;

  /** 부모 요소의 전체 너비 사용 여부 */
  fullWidth?: boolean;

  /** 검색 중 상태 */
  isLoading?: boolean;

  /** 검색어 초기화 버튼 표시 여부 */
  showClearButton?: boolean;
};

const sizeClassNames: Record<SearchInputSize, string> = {
  small: "h-9 px-3 text-14",
  medium: "h-11 px-4 text-14",
  large: "h-13 px-4 text-16",
};

const iconSizeClassNames: Record<SearchInputSize, string> = {
  small: "size-4",
  medium: "size-5",
  large: "size-5",
};

const clearButtonSizeClassNames: Record<SearchInputSize, string> = {
  small: "size-6",
  medium: "size-7",
  large: "size-7",
};

/**
 * 검색어 입력과 검색 실행, 초기화 기능을 제공하는 입력 컴포넌트입니다.
 *
 * @example 제어 방식
 *
 * ```tsx
 * const [keyword, setKeyword] = useState("");
 *
 * <SearchInput
 *   value={keyword}
 *   onValueChange={setKeyword}
 *   onSearch={(value) => console.log(value)}
 * />
 * ```
 *
 * @example 비제어 방식
 *
 * ```tsx
 * <SearchInput placeholder="상점 이름 검색" />
 * ```
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      defaultValue = "",
      onValueChange,
      onSearch,
      onClear,
      size = "medium",
      fullWidth = true,
      isLoading = false,
      showClearButton = true,
      disabled = false,
      readOnly = false,
      placeholder = "상점 이름 검색",
      className = "",
      onKeyDown,
      "aria-label": ariaLabel,
      ...inputProps
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    };

    const handleClear = () => {
      if (disabled || readOnly || isLoading) {
        return;
      }

      handleValueChange("");
      onClear?.();
    };

    const handleSearch = () => {
      if (disabled || isLoading) {
        return;
      }

      onSearch?.(currentValue.trim());
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }

      if (event.key === "Escape" && currentValue) {
        handleClear();
      }
    };

    const shouldShowClearButton =
      showClearButton &&
      currentValue.length > 0 &&
      !disabled &&
      !readOnly &&
      !isLoading;

    return (
      <div
        className={[
          "flex items-center gap-2 rounded-full bg-white",
          "text-black-950",
          "shadow-[0_0_10px_1px] shadow-black-950/10",
          "transition-shadow",
          "focus-within:ring-2",
          "focus-within:ring-black-950/30",
          disabled
            ? "cursor-not-allowed bg-black-100 text-black-400"
            : ["hover:shadow-[0_0_0_1px]", "hover:shadow-black-950/25"].join(
                " ",
              ),
          fullWidth ? "w-full" : "w-fit",
          sizeClassNames[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <SearchIcon
          aria-hidden="true"
          className={["shrink-0 text-black-500", iconSizeClassNames[size]].join(
            " ",
          )}
        />

        <input
          {...inputProps}
          ref={ref}
          type="search"
          value={currentValue}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          aria-label={ariaLabel ?? "검색어"}
          aria-busy={isLoading || undefined}
          onChange={(event) => handleValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className={[
            "min-w-0 flex-1 appearance-none border-0 bg-transparent",
            "outline-none ring-0",
            "focus:border-0 focus:outline-none focus:ring-0",
            "focus-visible:outline-none focus-visible:ring-0",
            "placeholder:text-black-400",
            "disabled:cursor-not-allowed",
            "[&::-webkit-search-cancel-button]:appearance-none",
            "[&::-webkit-search-decoration]:appearance-none",
          ].join(" ")}
        />

        {isLoading && (
          <LoadingIcon
            aria-hidden="true"
            className={[
              "shrink-0 text-black-500",
              iconSizeClassNames[size],
            ].join(" ")}
          />
        )}

        {shouldShowClearButton && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={handleClear}
            className={[
              "flex shrink-0 items-center justify-center rounded-full",
              "text-black-400 transition-colors",
              "hover:bg-black-100 hover:text-black-800",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-black-950",
              "focus-visible:ring-offset-2",
              clearButtonSizeClassNames[size],
            ].join(" ")}
          >
            <CloseCircleIcon aria-hidden="true" className="size-full" />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
