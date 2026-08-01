import type { ComponentPropsWithoutRef, ReactNode } from "react";

type BadgeVariant = "green" | "pink";
type BadgeShape = "pill" | "square";
interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  children: ReactNode;
  variant?: BadgeVariant;
  shape?: BadgeShape;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: ["h-[20px]", "px-2", "bg-green-100", "text-black-800", "text-10"].join(
    " ",
  ),

  pink: ["h-[20px]", "px-2.5", "bg-pink-200", "text-pink-500", "text-12"].join(
    " ",
  ),
};

const shapeStyles: Record<BadgeShape, string> = {
  pill: "rounded-full",
  square: "rounded-sm",
};

/**
 * 텍스트 길이에 따라 가로 너비가 자동으로 조절되는 배지 컴포넌트
 *
 * @example
 *
 * ```tsx
 * <Badge variant="pink" shape="pill" className="font-semibold">
 *   방문 완료
 * </Badge>
 * ```
 */
export function Badge({
  children,
  variant = "green",
  shape = "pill",
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
        shapeStyles[shape],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
