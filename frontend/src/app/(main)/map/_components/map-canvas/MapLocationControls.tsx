"use client";

import { CurrentLocationIcon, LocationIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";

type MapLocationControlsProps = Readonly<{
  visible?: boolean;
  className?: string;
  onSearchCurrentArea?: () => void;
  onMoveToCurrentLocation?: () => void;
}>;

export function MapLocationControls({
  visible = true,
  className,
  onSearchCurrentArea,
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
        aria-label="선택한 지역에서 검색"
        onClick={onSearchCurrentArea}
        className="rounded-full bg-white shadow-md"
      >
        <LocationIcon className="size-5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="medium"
        iconOnly
        aria-label="현재 위치로 이동"
        onClick={onMoveToCurrentLocation}
        className="rounded-full bg-white shadow-md"
      >
        <CurrentLocationIcon className="size-5" />
      </Button>
    </div>
  );
}
