import type { ComponentPropsWithoutRef, ReactNode } from "react";

type BadgeVariant = "green" | "pink" | "softGreen";
type BadgeShape = "pill" | "square";
type BadgeSize = "small" | "medium" | "large";

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  children: ReactNode;
  variant?: BadgeVariant | null;
  shape?: BadgeShape | null;
  size?: BadgeSize | null;
}

const variantStyles: Record<BadgeVariant, string> = {
  green: "text-green-800",
  pink: "text-pink-500",
  softGreen: "text-green-700",
};

const sizeStyles: Record<BadgeSize, string> = {
  small: "py-0.5 text-10",
  medium: "py-0.5 text-12",
  large: "py-1 text-14",
};

const shapeStyles: Record<BadgeShape, string> = {
  pill: "rounded-full",
  square: "rounded-control",
};

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
        variant ? variantStyles[variant] : "",
        size ? sizeStyles[size] : "",
        shape ? shapeStyles[shape] : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
