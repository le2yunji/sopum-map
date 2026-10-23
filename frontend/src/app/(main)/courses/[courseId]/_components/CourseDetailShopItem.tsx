"use client";

import Image from "next/image";

import type { CourseDetailShop } from "@sopum-map/shared";

import { CheckIcon, ChevronRightIcon } from "@/components/icons";

import { formatWalkingSegmentParts } from "../_utils/course-route-display";

type Props = Readonly<{
  shop: CourseDetailShop;
  nextShop: CourseDetailShop | null;
  onOpenActions: (shop: CourseDetailShop) => void;
}>;

/** 방문 순서, 상점 정보와 다음 구간 거리를 하나의 타임라인 행으로 표시합니다. */
export function CourseDetailShopItem({
  shop,
  nextShop,
  onOpenActions,
}: Props) {
  const walkingSegment =
    typeof nextShop?.walkingDistanceFromPreviousMeters === "number" &&
    typeof nextShop.walkingDurationFromPreviousSeconds === "number"
      ? {
          distanceMeters: nextShop.walkingDistanceFromPreviousMeters,
          durationSeconds: nextShop.walkingDurationFromPreviousSeconds,
        }
      : null;
  const walkingSegmentLabels = walkingSegment
    ? formatWalkingSegmentParts(walkingSegment)
    : null;

  return (
    <li className="grid grid-cols-[64px_minmax(0,1fr)] gap-2">
      <div className="flex flex-col items-center pt-[22px]">
        <span
          aria-label={
            shop.isVisited
              ? `${shop.name} 방문 완료`
              : `${shop.name} 방문 순서 ${shop.order}`
          }
          className={`grid size-9 shrink-0 place-items-center rounded-full border-2 text-14 font-semibold ${
            shop.isVisited
              ? "border-green-600 bg-green-600 text-white"
              : "border-green-500 bg-white text-green-700"
          }`}
        >
          {shop.isVisited ? (
            <CheckIcon className="size-4" aria-hidden="true" />
          ) : (
            shop.order
          )}
        </span>
        {nextShop ? (
          <span className="relative flex min-h-16 w-full flex-1 items-center justify-center py-2">
            <span
              className="absolute top-0 -bottom-[22px] left-1/2 w-px -translate-x-1/2 bg-black-200"
              aria-hidden="true"
            />
            {walkingSegmentLabels ? (
              <span className="relative bg-white px-1 text-center leading-tight">
                <span className="block whitespace-nowrap text-12 font-medium text-black-600">
                  {walkingSegmentLabels.durationLabel}
                </span>
                <span className="mt-0.5 block whitespace-nowrap text-[9px] text-black-400">
                  {walkingSegmentLabels.distanceLabel}
                </span>
              </span>
            ) : null}
          </span>
        ) : null}
      </div>

      <div className={nextShop ? "pb-[29px]" : "pb-1"}>
        <button
          type="button"
          aria-label={`${shop.name} 메뉴`}
          onClick={() => onOpenActions(shop)}
          className="flex min-h-20 w-full items-center gap-3 rounded-card text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          {shop.mainImageUrl ? (
            <span className="relative size-20 shrink-0 overflow-hidden rounded-card bg-black-100">
              <Image
                src={shop.mainImageUrl}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </span>
          ) : (
            <span
              className="size-20 shrink-0 rounded-card bg-black-100"
              aria-hidden="true"
            />
          )}

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-16 font-semibold">
                {shop.name}
              </span>
              {shop.isUnavailable ? (
                <span className="shrink-0 rounded-full bg-black-100 px-2 py-1 text-11 text-black-600">
                  이용 어려움
                </span>
              ) : null}
            </span>
            <span className="mt-1 block truncate text-13 text-black-500">
              {shop.address}
            </span>
            {shop.memo ? (
              <span className="mt-1 block truncate text-13 text-black-700">
                {shop.memo}
              </span>
            ) : null}
          </span>

          <ChevronRightIcon
            className="size-5 shrink-0 text-black-300"
            aria-hidden="true"
          />
        </button>

      </div>
    </li>
  );
}
