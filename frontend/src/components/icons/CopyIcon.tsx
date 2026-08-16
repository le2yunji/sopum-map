import type { SVGProps } from "react";

export function CopyIcon({
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
      <path d="M17.5003 9.5H10.0001C9.17169 9.5 8.50011 10.1716 8.50011 11V18.5002C8.50011 19.3286 9.17169 20.0002 10.0001 20.0002H17.5003C18.3287 20.0002 19.0003 19.3286 19.0003 18.5002V11C19.0003 10.1716 18.3287 9.5 17.5003 9.5Z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.50003 15.5002C4.67501 15.5002 4 14.8252 4 14.0002V6.50003C4 5.67501 4.67501 5 5.50003 5H13.0002C13.8252 5 14.5002 5.67501 14.5002 6.50003" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
