"use client";

import { MAP_REGIONS, type MapRegion } from "../_constants/map.constants";

import { BottomSheet } from "@/components/ui/BottomSheet";

/** 지역을 고르면 지도 이동 요청을 부모 화면으로 전달합니다. */
type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRegion: (region: MapRegion) => void;
}>;

/** 지원 지역을 선택하는 지도 이동 바텀시트입니다. */
export function MapRegionSheet({ open, onOpenChange, onSelectRegion }: Props) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      ariaLabelledBy="map-region-sheet-title"
      showCloseButton
      closeButtonLabel="지역 선택 닫기"
    >
      <BottomSheet.Handle />

      <BottomSheet.Header>
        <BottomSheet.Title id="map-region-sheet-title">
          지역 이동
        </BottomSheet.Title>
      </BottomSheet.Header>

      <BottomSheet.Body>
        <ul>
          {MAP_REGIONS.map((region, index) => {
            const hasSeparator = index < MAP_REGIONS.length - 1;

            return (
              <li
                key={region.value}
                className={hasSeparator ? "border-b border-black-100" : ""}
              >
                <button
                  type="button"
                  className="
                    flex min-h-12 w-full items-center
                    px-3 text-left text-14 font-medium text-black-900
                    transition-colors
                    hover:bg-black-100
                    focus-visible:outline-2
                    focus-visible:outline-offset-[-2px]
                    focus-visible:outline-green-700
                  "
                  onClick={() => {
                    onSelectRegion(region.value);
                  }}
                >
                  {region.label}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet.Body>
    </BottomSheet>
  );
}
