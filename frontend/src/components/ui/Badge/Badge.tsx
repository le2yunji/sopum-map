import type { ComponentPropsWithoutRef, ReactNode } from "react";

type BadgeVariant = "green" | "pink";

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: ["h-[19px]", "px-2", "bg-green-100", "text-black-800", "text-10"].join(
    " ",
  ),

  pink: [
    "h-[26px]",
    "px-2.5",
    "bg-pink-300/[0.18]",
    "border",
    "border-pink-300/[0.35]",
    "text-black-800",
    "text-12",
  ].join(" "),
};

/**
 * 텍스트 길이에 따라 가로 너비가 자동으로 조절되는 배지 컴포넌트
 *
 * @example
 *
 * ```tsx
 * <Badge variant="pink" className="font-semibold">
 *   방문 완료
 * </Badge>
 * ```
 */
export function Badge({
  children,
  variant = "green",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex",
        "w-fit",
        "shrink-0",
        "items-center",
        "justify-center",
        "whitespace-nowrap",
        "rounded-full",
        "box-border",
        "font-medium",
        variantStyles[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
