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
  green: ["bg-green-100", "text-black-800"].join(" "),

  pink: [
    "bg-pink-300/15",
    "text-green-700",
    "border",
    "border-pink-300/35",
  ].join(" "),

  softGreen: ["bg-green-50", "text-green-700"].join(" "),
};

const sizeStyles: Record<BadgeSize, string> = {
  small: ["px-2", "py-1", "text-10"].join(" "),
  medium: ["px-3", "py-1.5", "text-12"].join(" "),
  large: ["px-4", "py-2", "text-14"].join(" "),
};

const shapeStyles: Record<BadgeShape, string> = {
  pill: "rounded-full",
  square: "rounded-md",
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
