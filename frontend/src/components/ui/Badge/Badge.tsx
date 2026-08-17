import type { ComponentPropsWithoutRef, ReactNode } from "react";

type BadgeVariant = "green" | "pink";
type BadgeShape = "pill" | "square";
type BadgeSize = "small" | "medium";

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  children: ReactNode;
  variant?: BadgeVariant;
  shape?: BadgeShape;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: ["bg-green-100", "text-black-800"].join(" "),

  pink: [
    "bg-pink-300/15",
    "text-green-700",
    "border",
    "border-pink-300/35",
  ].join(" "),
};

const sizeStyles: Record<BadgeSize, string> = {
  small: ["h-5", "px-2", "text-10"].join(" "),
  medium: ["h-6", "px-3", "text-12"].join(" "),
};

const shapeStyles: Record<BadgeShape, string> = {
  pill: "rounded-full",
  square: "rounded-md",
};

/**
 * 텍스트 길이에 따라 가로 너비가 자동으로 조절되는 배지 컴포넌트
 *
 * @example
 * ```tsx
 * <Badge
 *   variant="pink"
 *   shape="pill"
 *   size="medium"
 *   className="font-semibold"
 * >
 *   방문 완료
 * </Badge>
 * ```
 */
export function Badge({
  children,
  variant = "green",
  shape = "pill",
  size = "medium",
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
        "box-border",
        "font-medium",
        variantStyles[variant],
        sizeStyles[size],
        shapeStyles[shape],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
