"use client";

import { useState } from "react";

import type { CourseDetailShop } from "@sopum-map/shared";

import {
  useCourseVisitOrderSheetGesture,
  type CourseVisitOrderSheetState,
} from "../_hooks/courseVisitOrderSheet";

import { CourseDetailShopItem } from "./CourseDetailShopItem";
import {
  COURSE_DETAIL_SHEET_HANDLE_CLASS_NAME,
  COURSE_DETAIL_SHEET_HORIZONTAL_PADDING_CLASS_NAME,
  COURSE_DETAIL_SHEET_SURFACE_CLASS_NAME,
} from "./course-detail-sheet.styles";

type Props = Readonly<{
  shops: readonly CourseDetailShop[];
  expandedTopOffset: number;
  onOpenShopActions: (
    shop: CourseDetailShop,
    previousShop: CourseDetailShop | null,
  ) => void;
}>;

/** 지도 위에서 접고 펼칠 수 있는 방문순서 목록을 표시합니다. */
export function CourseVisitOrderSheet({
  shops,
  expandedTopOffset,
  onOpenShopActions,
}: Props) {
  const [state, setState] = useState<CourseVisitOrderSheetState>("collapsed");
  const isExpanded = state === "expanded";
  const {
    sheetRef,
    listRef,
    initialTransform,
    toggleSheet,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleListClickCapture,
  } = useCourseVisitOrderSheetGesture({
    state,
    expandedTopOffset,
    onStateChange: setState,
  });

  return (
    <section
      ref={sheetRef}
      aria-label="코스 방문 순서"
      style={{
        height: `calc(100% - ${expandedTopOffset}px)`,
        transform: initialTransform,
      }}
      className={`absolute inset-x-0 bottom-0 z-30 flex flex-col overflow-hidden ${COURSE_DETAIL_SHEET_SURFACE_CLASS_NAME}`}
    >
      <button
        type="button"
        aria-label={isExpanded ? "방문 순서 접기" : "방문 순서 펼치기"}
        aria-expanded={isExpanded}
        onClick={toggleSheet}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`block w-full shrink-0 cursor-grab touch-none select-none pb-3 pt-3 text-left active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-green-700 ${COURSE_DETAIL_SHEET_HORIZONTAL_PADDING_CLASS_NAME}`}
      >
        <span
          aria-hidden="true"
          className={`mx-auto mb-3 block ${COURSE_DETAIL_SHEET_HANDLE_CLASS_NAME}`}
        />

        <span className="flex items-center justify-between">
          <span className="text-16 font-semibold">방문 순서</span>
          <span className="text-12 text-black-500">{shops.length}곳</span>
        </span>
      </button>

      {shops.length === 0 ? (
        <p className="px-5 pt-4 text-14 text-black-500">
          아직 코스에 담긴 상점이 없습니다.
        </p>
      ) : (
        <ol
          ref={listRef}
          aria-hidden={!isExpanded}
          inert={!isExpanded}
          onClickCapture={handleListClickCapture}
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(24px,env(safe-area-inset-bottom))] ${COURSE_DETAIL_SHEET_HORIZONTAL_PADDING_CLASS_NAME}`}
        >
          {shops.map((shop, index) => (
            <CourseDetailShopItem
              key={shop.id}
              shop={shop}
              nextShop={shops[index + 1] ?? null}
              onOpenActions={() => {
                onOpenShopActions(shop, shops[index - 1] ?? null);
              }}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
