import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonSize = "small" | "medium" | "large";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  iconOnly?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-green-500",
    "text-white",
    "hover:bg-green-600",
    "active:bg-green-600",
  ].join(" "),

  secondary: [
    "bg-green-100",
    "text-black-950",
    "hover:bg-green-200",
    "active:bg-green-300",
  ].join(" "),

  outline: [
    "border",
    "border-pink-300/30",
    "bg-white",
    "text-black-800",
    "hover:bg-pink-300/10",
    "active:bg-pink-300/20",
  ].join(" "),

  ghost: [
    "bg-transparent",
    "text-black-950",
    "hover:bg-black-100",
    "active:bg-black-300",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  small: "min-h-9 rounded-lg px-3 py-2 text-12",
  medium: "min-h-11 rounded-xl px-4 py-3 text-14",
  large: "min-h-13 rounded-xl px-5 py-3.5 text-16",
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  small: "size-9",
  medium: "size-11",
  large: "size-13",
};

/**
 * 공통 버튼 컴포넌트입니다.
 *
 * `variant`, `size`를 통해 스타일을 설정할 수 있으며,
 * 아이콘 버튼과 로딩 상태를 지원합니다.
 *
 * @example
 * 기본 버튼
 *
 * ```tsx
 * <Button variant="primary" size="medium">
 *   저장하기
 * </Button>
 * ```
 *
 * @example
 * 아이콘 버튼
 *
 * ```tsx
 * <Button
 *   iconOnly
 *   variant="ghost"
 *   size="small"
 *   aria-label="검색어 삭제"
 * >
 *   <XIcon />
 * </Button>
 * ```
 *
 * @example
 * 로딩 버튼
 *
 * ```tsx
 * <Button isLoading disabled>
 *   저장하기
 * </Button>
 * ```
 */
export function Button({
  type = "button",
  variant = "primary",
  size = "medium",
  fullWidth = false,
  isLoading = false,
  iconOnly = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const buttonClassName = [
    "inline-flex shrink-0 items-center justify-center",
    "font-semibold transition-colors",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-green-500",
    "focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed",
    "disabled:border-black-100",
    "disabled:bg-black-100",
    "disabled:text-black-400",
    variantClasses[variant],
    iconOnly
      ? `${iconOnlySizeClasses[size]} rounded-full p-0`
      : `${sizeClasses[size]} gap-2`,
    fullWidth && !iconOnly ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      type={type}
      className={buttonClassName}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            className="
              size-4 animate-spin rounded-full
              border-2 border-current border-r-transparent
            "
          />

          {!iconOnly && <span>처리 중</span>}
        </>
      ) : iconOnly ? (
        <span aria-hidden="true">{children}</span>
      ) : (
        <>
          {leftIcon && (
            <span aria-hidden="true" className="shrink-0">
              {leftIcon}
            </span>
          )}

          {children && <span>{children}</span>}

          {rightIcon && (
            <span aria-hidden="true" className="shrink-0">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}
