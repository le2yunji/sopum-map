import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonSize = "small" | "medium" | "large";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
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

export function Button({
  type = "button",
  variant = "primary",
  size = "medium",
  fullWidth = false,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const buttonClassName = [
    "inline-flex items-center justify-center gap-2",
    "font-semibold transition",
    "focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:bg-foreground/10 disabled:text-secondary/30",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
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
          <span>처리 중</span>
        </>
      ) : (
        <>
          {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
