"use client";

import { CloseCircleIcon } from "@/components/icons";
import { LoadingIcon } from "@/components/icons";
import { SearchIcon } from "@/components/icons";
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
  value?: string; // 제어 컴포넌트로 사용할 때의 검색어
  defaultValue?: string; // 비제어 컴포넌트로 사용할 때의 초기 검색어
  onValueChange?: (value: string) => void; // 검색어 변경 이벤트
  onSearch?: (value: string) => void; // Enter 입력 또는 검색 버튼 클릭 시 실행
  onClear?: () => void; // 검색어 초기화 시 실행
  size?: SearchInputSize; // 입력창 크기
  fullWidth?: boolean; // 부모 요소의 전체 너비 사용 여부
  isLoading?: boolean; // 검색 중 상태
  showClearButton?: boolean; // 검색어 초기화 버튼 표시 여부
};

const sizeClassNames: Record<SearchInputSize, string> = {
  small: "h-9 px-3 text-sm",
  medium: "h-11 px-4 text-sm",
  large: "h-13 px-4 text-base",
};

const iconSizeClassNames: Record<SearchInputSize, string> = {
  small: "size-4",
  medium: "size-5",
  large: "size-5",
};

/**
 *
 * @example
 * ```tsx
 * const [keyword, setKeyword] = useState("");
 *
 * <SearchInput
 *   value={keyword}
 *   onValueChange={setKeyword}
 *   onSearch={(value) => console.log(value)}
 * />
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
    // 비제어 방식에서 사용할 내부 검색어 상태
    const [internalValue, setInternalValue] = useState(defaultValue);
    // // value prop 전달 여부에 따라 제어/비제어 컴포넌트를 구분
    const isControlled = value !== undefined;
    // 제어 방식이면 외부 value를, 비제어 방식이면 내부 상태를 사용
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
          "text-gray-900",
          "shadow-[0_0_10px_1px_rgba(0,0,0,0.12)]",
          "transition-shadow",
          "focus-within:shadow-[0_0_0_2px_rgba(2,0,0,0.3)]",
          disabled
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "hover:shadow-[0_0_0_1px_rgba(0,0,0,0.25)]",
          fullWidth ? "w-full" : "w-fit",
          sizeClassNames[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <SearchIcon
          className={["shrink-0 text-gray-500", iconSizeClassNames[size]].join(
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
          aria-busy={isLoading}
          onChange={(event) => handleValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className={[
            "min-w-0 flex-1 appearance-none border-0 bg-transparent",
            "outline-none ring-0",
            "focus:border-0 focus:outline-none focus:ring-0",
            "focus-visible:outline-none focus-visible:ring-0",
            "placeholder:text-gray-400",
            "disabled:cursor-not-allowed",
            "[&::-webkit-search-cancel-button]:appearance-none",
            "[&::-webkit-search-decoration]:appearance-none",
          ].join(" ")}
        />

        {isLoading && (
          <LoadingIcon
            className={[
              "shrink-0 text-gray-500",
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
              "text-gray-400 transition-colors",
              "hover:bg-gray-100 hover:text-gray-700",
              "focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-gray-900",
              iconSizeClassNames[size],
            ].join(" ")}
          >
            <CloseCircleIcon className="size-7" />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
