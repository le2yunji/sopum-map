import type { SVGProps } from "react";

export function MenuIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20.75 18C21.1642 18 21.5 18.3358 21.5 18.75C21.5 19.1642 21.1642 19.5 20.75 19.5H3.75C3.33579 19.5 3 19.1642 3 18.75C3 18.3358 3.33579 18 3.75 18H20.75ZM20.75 11C21.1642 11 21.5 11.3358 21.5 11.75C21.5 12.1642 21.1642 12.5 20.75 12.5H3.75C3.33579 12.5 3 12.1642 3 11.75C3 11.3358 3.33579 11 3.75 11H20.75ZM20.75 4C21.1642 4 21.5 4.33579 21.5 4.75C21.5 5.16421 21.1642 5.5 20.75 5.5H3.75C3.33579 5.5 3 5.16421 3 4.75C3 4.33579 3.33579 4 3.75 4H20.75Z" fill="currentColor"/>
    </svg>
  );
}
