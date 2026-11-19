import type { ReactNode } from "react";

type Props = Readonly<{
  children: ReactNode;
  modal: ReactNode;
}>;

/** 방문 로그 피드 위에 인터셉트된 상세 모달을 함께 렌더링합니다. */
export default function MyVisitLogsLayout({ children, modal }: Props) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
