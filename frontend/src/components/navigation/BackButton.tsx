"use client";

import { useRouter } from "next/navigation";

import { ChevronLeftIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

type BackButtonProps = Readonly<{
  ariaLabel?: string;
  className?: string;
}>;

/** 현재 화면을 연 브라우저 기록으로 돌아갑니다. */
export function BackButton({
  ariaLabel = "이전 화면",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      type="button"
      iconOnly
      size="small"
      variant="ghost"
      aria-label={ariaLabel}
      onClick={() => router.back()}
      className={className}
    >
      <ChevronLeftIcon className="size-5" />
    </Button>
  );
}
