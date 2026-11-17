import type { SVGProps } from "react";

type VisitLogStatusMarkProps = Readonly<{
  isComplete: boolean;
}>;

/** 빈 원과 꽃을 전환해 방문로그 작성 상태를 보여줍니다. */
export function VisitLogStatusMark({ isComplete }: VisitLogStatusMarkProps) {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center"
    >
      {isComplete ? (
        <VisitLogFlowerIcon
          aria-hidden="true"
          className="size-6 text-pink-300"
        />
      ) : (
        <span
          aria-hidden="true"
          className="size-5 rounded-full border border-black-300 bg-white"
        />
      )}
    </span>
  );
}

/** 방문로그 작성을 나타내는 소품지도 꽃 아이콘입니다. */
function VisitLogFlowerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M9.81738 0C12.0263 0 13.8172 1.85816 13.8174 4.15039C13.8174 4.55487 13.7602 4.9458 13.6562 5.31543C14.3148 4.82054 15.1238 4.52837 15.999 4.52832C18.208 4.52832 19.999 6.38635 19.999 8.67871C19.999 10.9039 18.3117 12.7197 16.1924 12.8242C16.9685 13.5813 17.4541 14.656 17.4541 15.8486C17.4541 18.1409 15.663 19.9989 13.4541 19.999C11.8397 19.999 10.4493 19.0063 9.81738 17.5771C9.18549 19.0062 7.79593 19.999 6.18164 19.999C3.97264 19.999 2.18169 18.141 2.18164 15.8486C2.18164 14.6397 2.67985 13.5516 3.47461 12.793C1.51386 12.526 0 10.7863 0 8.67871C5.43828e-05 6.38635 1.791 4.52832 4 4.52832C4.69104 4.52835 5.34105 4.71013 5.9082 5.03027C5.84926 4.74677 5.81836 4.45219 5.81836 4.15039C5.81856 1.85826 7.60862 0.000171938 9.81738 0Z"
        fill="currentColor"
      />
      <ellipse
        cx="9.81779"
        cy="10.9432"
        rx="2.54533"
        ry="2.6414"
        fill="white"
      />
    </svg>
  );
}
