"use client";

import { Button } from "@/components/ui/Button/Button";

type Props = Readonly<{
  reset: () => void;
}>;

export default function Error({ reset }: Props) {
  return (
    <div className="py-10 text-center">
      <p className="text-14 text-black-500">상점 정보를 불러오지 못했어요</p>

      <Button className="mt-4" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}
