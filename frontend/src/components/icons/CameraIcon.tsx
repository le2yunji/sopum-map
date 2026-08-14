import type { SVGProps } from "react";

export function CameraIcon({
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
      <path d="M19.6 9.6C19.6 9.28174 19.4736 8.97652 19.2485 8.75147C19.0235 8.52643 18.7183 8.4 18.4 8.4H16L14.2 6H9.4L7.6 8.4H5.2C4.88174 8.4 4.57652 8.52643 4.35147 8.75147C4.12643 8.97652 4 9.28174 4 9.6V16.8C4 17.1183 4.12643 17.4235 4.35147 17.6485C4.57652 17.8736 4.88174 18 5.2 18H18.4C18.7183 18 19.0235 17.8736 19.2485 17.6485C19.4736 17.4235 19.6 17.1183 19.6 16.8V9.6Z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.7092 14.5096C13.2028 15.0159 12.5161 15.3004 11.8 15.3004C11.0839 15.3004 10.3972 15.0159 9.89082 14.5096C9.38447 14.0032 9.10001 13.3165 9.10001 12.6004C9.10001 11.8843 9.38447 11.1976 9.89082 10.6912C10.3972 10.1849 11.0839 9.90039 11.8 9.90039C12.5161 9.90039 13.2028 10.1849 13.7092 10.6912C14.2155 11.1976 14.5 11.8843 14.5 12.6004C14.5 13.3165 14.2155 14.0032 13.7092 14.5096Z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
