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
  primary: "bg-brand text-white hover:opacity-90 active:opacity-80",

  secondary: "bg-brand-soft text-foreground hover:opacity-90 active:opacity-80",

  outline:
    "border border-accent-pink/30 bg-background text-secondary hover:bg-accent-pink/10 active:bg-brand-soft",

  ghost: "bg-transparent text-foreground hover:bg-background active:bg-border",
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
    "font-semibold transition",
    "focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:bg-foreground/10 disabled:text-secondary/30",
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
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          {!iconOnly && <span>처리 중</span>}
        </>
      ) : iconOnly ? (
        <span aria-hidden="true">{children}</span>
      ) : (
        <>
          {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
