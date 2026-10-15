"use client";

import Image from "next/image";

import type { CourseDetailShop } from "@sopum-map/shared";

import { ChevronRightIcon } from "@/components/icons";

import { formatWalkingSegment } from "./course-route-display";
import { CourseShopVisitButton } from "./CourseShopVisitButton";

type Props = Readonly<{
  shop: CourseDetailShop;
  nextShop: CourseDetailShop | null;
  onOpenActions: (shop: CourseDetailShop) => void;
  isVisitPending: boolean;
  onSetVisited: () => Promise<void>;
  onUnsetVisited: () => Promise<void>;
  onWriteLog: () => void;
  onVisitError: () => void;
}>;

/** 방문 순서, 상점 정보와 다음 구간 거리를 하나의 타임라인 행으로 표시합니다. */
export function CourseDetailShopItem({
  shop,
  nextShop,
  onOpenActions,
  isVisitPending,
  onSetVisited,
  onUnsetVisited,
  onWriteLog,
  onVisitError,
}: Props) {
  const walkingSegment =
    typeof nextShop?.walkingDistanceFromPreviousMeters === "number" &&
    typeof nextShop.walkingDurationFromPreviousSeconds === "number"
      ? {
          distanceMeters: nextShop.walkingDistanceFromPreviousMeters,
          durationSeconds: nextShop.walkingDurationFromPreviousSeconds,
        }
      : null;

  return (
    <li className="grid grid-cols-[48px_minmax(0,1fr)] gap-3">
      <div className="flex flex-col items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-green-500 text-15 font-semibold text-white">
          {shop.order}
        </span>
        {nextShop ? <span className="mt-2 w-px flex-1 bg-black-100" aria-hidden="true" /> : null}
      </div>

      <div className={nextShop ? "pb-6" : "pb-1"}>
        <button
          type="button"
          aria-label={`${shop.name} 메뉴`}
          onClick={() => onOpenActions(shop)}
          className="flex min-h-20 w-full items-center gap-3 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          {shop.mainImageUrl ? (
            <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-black-100">
              <Image src={shop.mainImageUrl} alt="" fill sizes="80px" className="object-cover" />
            </span>
          ) : (
            <span className="size-20 shrink-0 rounded-xl bg-black-100" aria-hidden="true" />
          )}

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-16 font-semibold">{shop.name}</span>
              {shop.isUnavailable ? <span className="shrink-0 rounded-full bg-black-100 px-2 py-1 text-11 text-black-600">이용 어려움</span> : null}
            </span>
            <span className="mt-1 block truncate text-13 text-black-500">{shop.address}</span>
            {shop.memo ? <span className="mt-2 block line-clamp-2 text-13 text-black-700">{shop.memo}</span> : null}
          </span>

          <ChevronRightIcon className="size-5 shrink-0 text-black-300" aria-hidden="true" />
        </button>

        <CourseShopVisitButton
          isVisited={shop.isVisited}
          isPending={isVisitPending}
          onSetVisited={onSetVisited}
          onUnsetVisited={onUnsetVisited}
          onWriteLog={onWriteLog}
          onError={onVisitError}
        />

        {walkingSegment ? (
          <div className="mt-4 inline-flex rounded-lg bg-black-50 px-3 py-2 text-12 text-black-600">
            {formatWalkingSegment(walkingSegment)}
          </div>
        ) : null}
      </div>
    </li>
  );
}
