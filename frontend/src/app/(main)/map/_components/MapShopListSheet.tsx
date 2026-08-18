"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { HeartIcon, LocationIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";

import type { MapShop } from "../_types/map.types";
import { PickAction } from "@/components/pick/PickAction";

export type MapShopListSheetState = "collapsed" | "expanded";

type MapShopListSheetProps = Readonly<{
  shops: MapShop[];
  visible?: boolean;
  state: MapShopListSheetState;
  selectedShopId?: string;
  selectedRegionLabel?: string;
  selectedTagCount: number;

  onStateChange: (state: MapShopListSheetState) => void;

  onSelectShop: (shopId: string) => void;
  onResetFilters: () => void;
}>;

/**
 * 접힌 상태에서
 * - 핸들
 * - 제목
 * - 첫 번째 상점 카드 일부
 * 가 보이는 높이
 */
const COLLAPSED_HEIGHT = 200;

/**
 * 펼쳤을 때 지도 상단에서 남겨둘 공간
 */
const EXPANDED_TOP_OFFSET = 128;

/**
 * 이 정도 이상 움직이면 drag로 판단
 */
const DRAG_THRESHOLD = 40;

/**
 * click과 drag를 구분하기 위한 최소 이동 거리
 */
const DRAG_START_THRESHOLD = 5;

export function MapShopListSheet({
  shops,
  visible = true,
  state,
  selectedShopId,
  selectedRegionLabel,
  selectedTagCount,
  onStateChange,
  onSelectShop,
  onResetFilters,
}: MapShopListSheetProps) {
  const isExpanded = state === "expanded";

  const sheetRef = useRef<HTMLElement>(null);

  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(0);
  const didDragRef = useRef(false);

  const [dragHeight, setDragHeight] = useState<number>();

  /**
   * window.innerHeight가 아니라
   * MapShopListSheet의 실제 부모 높이를 기준으로 계산한다.
   */
  const getExpandedHeight = () => {
    const parentHeight = sheetRef.current?.parentElement?.clientHeight;

    if (!parentHeight) {
      return COLLAPSED_HEIGHT;
    }

    return Math.max(parentHeight - EXPANDED_TOP_OFFSET, COLLAPSED_HEIGHT);
  };

  const toggleSheet = () => {
    /**
     * 드래그가 끝난 직후 발생하는 click 이벤트 무시
     */
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    onStateChange(isExpanded ? "collapsed" : "expanded");
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);

    didDragRef.current = false;
    dragStartYRef.current = event.clientY;

    dragStartHeightRef.current = isExpanded
      ? getExpandedHeight()
      : COLLAPSED_HEIGHT;

    setDragHeight(dragStartHeightRef.current);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragHeight === undefined) {
      return;
    }

    const deltaY = dragStartYRef.current - event.clientY;

    if (Math.abs(deltaY) > DRAG_START_THRESHOLD) {
      didDragRef.current = true;
    }

    const nextHeight = dragStartHeightRef.current + deltaY;

    const minHeight = COLLAPSED_HEIGHT;
    const maxHeight = getExpandedHeight();

    setDragHeight(Math.min(Math.max(nextHeight, minHeight), maxHeight));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragHeight === undefined) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const deltaY = dragStartYRef.current - event.clientY;

    /**
     * 실질적인 drag가 아니면
     * onClick에서 toggle을 담당한다.
     */
    if (!didDragRef.current) {
      setDragHeight(undefined);
      return;
    }

    if (Math.abs(deltaY) >= DRAG_THRESHOLD) {
      onStateChange(deltaY > 0 ? "expanded" : "collapsed");
    } else {
      const expandedHeight = getExpandedHeight();

      const middleHeight = (COLLAPSED_HEIGHT + expandedHeight) / 2;

      onStateChange(dragHeight >= middleHeight ? "expanded" : "collapsed");
    }

    setDragHeight(undefined);
  };

  const handlePointerCancel = () => {
    didDragRef.current = false;
    setDragHeight(undefined);
  };

  const sheetHeight =
    dragHeight ??
    (isExpanded
      ? `calc(100% - ${EXPANDED_TOP_OFFSET}px)`
      : `${COLLAPSED_HEIGHT}px`);

  return (
    <section
      ref={sheetRef}
      aria-label="검색된 소품샵"
      style={{
        height: sheetHeight,
      }}
      aria-hidden={!visible}
      inert={!visible}
      className={`
        absolute inset-x-0 bottom-0 z-9999
        overflow-hidden
        rounded-t-3xl
        bg-white
        shadow-[0_-6px_16px_rgba(0,0,0,0.08)]
        transition-transform duration-300 ease-out
        ${visible ? "translate-y-0" : "pointer-events-none translate-y-full"}
        ${
          dragHeight === undefined
            ? "transition-[height] duration-300 ease-out"
            : ""
        }
      `}
    >
      <button
        type="button"
        aria-label={isExpanded ? "상점 목록 접기" : "상점 목록 펼치기"}
        aria-expanded={isExpanded}
        onClick={toggleSheet}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="
          block w-full
          cursor-grab
          touch-none
          select-none
          px-4
          pb-2
          pt-3
          text-left
          active:cursor-grabbing
        "
      >
        <span
          aria-hidden="true"
          className="
            mx-auto mb-3 block
            h-1 w-10
            rounded-full
            bg-black-300
          "
        />

        <span className="flex items-center justify-between">
          <span className="font-semibold">
            {selectedRegionLabel ? `${selectedRegionLabel} ` : "주변 "}
            <span className="text-green-600">{shops.length}</span>
          </span>

          {selectedTagCount > 0 && (
            <span className="text-12 text-black-500">
              태그 {selectedTagCount}개 적용
            </span>
          )}
        </span>
      </button>

      {shops.length === 0 ? (
        <div
          role="status"
          className="
            grid h-32
            place-items-center
            px-4
            text-center
          "
        >
          <div>
            <p className="font-semibold">조건에 맞는 상점이 없어요</p>

            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={onResetFilters}
              className="
                mt-2
                text-green-700
                underline
              "
            >
              필터 초기화
            </Button>
          </div>
        </div>
      ) : (
        <ul
          className={`
            px-4
            divide-y divide-black-100
            ${
              isExpanded && dragHeight === undefined
                ? `
                  h-[calc(100%_-_60px)]
                  overflow-y-auto
                  overscroll-contain
                `
                : `
                  overflow-hidden
                `
            }
          `}
        >
          {shops.map((shop, index) => {
            const isSelected = selectedShopId === shop.id;

            return (
              <li
                key={shop.id}
                className={`
                  relative
                  ${isSelected ? "rounded-2xl bg-green-50" : ""}
                `}
              >
                <Link
                  href={`/shops/${shop.id}`}
                  onFocus={() => onSelectShop(shop.id)}
                  className="
                    flex gap-3
                    py-3
                    pr-10
                    focus-visible:outline-2
                    focus-visible:outline-green-700
                  "
                >
                  <Image
                    src={shop.imageUrl}
                    alt={`${shop.name} 매장 이미지`}
                    width={80}
                    height={80}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="
                      size-20
                      shrink-0
                      rounded-xl
                      object-cover
                    "
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-16 font-semibold">
                      {shop.name}
                    </h3>

                    <p className="mt-1 truncate text-12 text-black-500">
                      {shop.address}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-12 text-green-700">
                      <LocationIcon className="size-3.5" />
                      {shop.region}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {shop.tags.map((tag) => (
                        <span
                          key={tag}
                          className="
                              rounded-full
                              bg-green-100
                              px-2 py-1
                              text-10
                              text-green-900
                            "
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>

                <PickAction shopId={shop.id} initialIsPicked={shop.isLiked}>
                  {({ isPicked, onToggle }) => (
                    <Button
                      type="button"
                      iconOnly
                      size="small"
                      variant="ghost"
                      aria-label={isPicked ? "내 픽에서 제거" : "내 픽에 추가"}
                      aria-pressed={isPicked}
                      onClick={() => void onToggle()}
                      className="
                        absolute right-1 top-2
                        hover:bg-transparent!
                        active:bg-transparent!
                      "
                    >
                      <HeartIcon
                        filled={isPicked}
                        className={
                          isPicked
                            ? "size-6! text-red-600 [&_path]:stroke-[2]"
                            : "size-6! text-black-300 [&_path]:stroke-[1.5]"
                        }
                      />
                    </Button>
                  )}
                </PickAction>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
