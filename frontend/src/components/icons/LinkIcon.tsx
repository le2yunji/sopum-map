import type { SVGProps } from "react";

export function LinkIcon({
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
      <path d="M13.1667 10.8333L19 5M19 8.88889V5H15.1111M19 13.5556V17.4444C19 17.857 18.8361 18.2527 18.5444 18.5444C18.2527 18.8361 17.857 19 17.4444 19H6.55556C6.143 19 5.74733 18.8361 5.45561 18.5444C5.16389 18.2527 5 17.857 5 17.4444V6.55556C5 6.143 5.16389 5.74733 5.45561 5.45561C5.74733 5.16389 6.143 5 6.55556 5H10.4444" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
