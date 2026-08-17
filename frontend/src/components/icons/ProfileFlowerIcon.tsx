import type { SVGProps } from "react";

/** 기본 프로필을 위한 다섯 잎 꽃 아이콘입니다. */
export function ProfileFlowerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="32" cy="18" r="10" className="fill-pink-300" />
      <circle cx="45" cy="28" r="10" className="fill-pink-300" />
      <circle cx="40" cy="43" r="10" className="fill-pink-300" />
      <circle cx="24" cy="43" r="10" className="fill-pink-300" />
      <circle cx="19" cy="28" r="10" className="fill-pink-300" />
      <circle cx="32" cy="31" r="6" className="fill-white" />
    </svg>
  );
}
