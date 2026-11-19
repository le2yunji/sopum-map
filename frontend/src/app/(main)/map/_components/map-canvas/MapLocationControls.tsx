"use client";

import { CurrentLocationIcon, LocationIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";

type MapLocationControlsProps = Readonly<{
  visible?: boolean;
  className?: string;
  isLocating?: boolean;
  onOpenRegionSheet?: () => void;
  onMoveToCurrentLocation?: () => void;
}>;

/** 지역 선택과 현재 위치 이동 동작을 지도 화면으로 전달합니다. */
export function MapLocationControls({
  visible = true,
  className,
  isLocating = false,
  onOpenRegionSheet,
  onMoveToCurrentLocation,
}: MapLocationControlsProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={`absolute left-4 z-20 flex flex-col gap-2 ${className ?? ""}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="medium"
        iconOnly
        aria-label="지역 선택"
        onClick={onOpenRegionSheet}
        className="rounded-full bg-white shadow-md"
      >
        <LocationIcon className="size-5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="medium"
        iconOnly
        isLoading={isLocating}
        aria-label={isLocating ? "현재 위치 확인 중" : "현재 위치로 이동"}
        onClick={onMoveToCurrentLocation}
        className="rounded-full bg-white shadow-md"
      >
        <CurrentLocationIcon className="size-5" />
      </Button>

      {isLocating ? (
        <span role="status" className="sr-only">
          현재 위치를 확인하는 중입니다.
        </span>
      ) : null}
    </div>
  );
}
