"use client";

import Image from "next/image";

import type { CourseDetailShop } from "@sopum-map/shared";

import { CheckIcon, ChevronRightIcon } from "@/components/icons";
import { BottomSheet } from "@/components/ui/BottomSheet";

type Props = Readonly<{
  open: boolean;
  shop: CourseDetailShop | null;
  onOpenChange: (open: boolean) => void;
  onViewShop: () => void;
  onOpenRoute: () => void;
  isVisitPending: boolean;
  onVisitToggle: () => void;
}>;

/** 상점 행의 보조 액션을 필요할 때만 보여줍니다. */
export function CourseShopActionSheet({
  open,
  shop,
  onOpenChange,
  onViewShop,
  onOpenRoute,
  isVisitPending,
  onVisitToggle,
}: Props) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      ariaLabelledBy="course-shop-action-title"
    >
      <BottomSheet.Handle />
      <BottomSheet.Header className="mt-0">
        <BottomSheet.Title id="course-shop-action-title" className="sr-only">
          {shop?.name ?? "상점"}
        </BottomSheet.Title>
      </BottomSheet.Header>
      <BottomSheet.Body className="mt-4">
        {shop ? (
          <section className="space-y-3 px-4 pb-4">
            {shop.mainImageUrl ? (
              <span className="relative block aspect-video w-full overflow-hidden rounded-card bg-black-100">
                <Image
                  src={shop.mainImageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 480px) calc(100vw - 80px), 400px"
                  className="object-cover"
                />
              </span>
            ) : (
              <span
                className="block aspect-video w-full rounded-card bg-black-100"
                aria-hidden="true"
              />
            )}
            <div>
              <h3 className="text-16 font-semibold text-black-950">
                {shop.name}
              </h3>
              <p className="mt-1 text-13 text-black-500">{shop.address}</p>
              {shop.memo ? (
                <p className="mt-2 whitespace-pre-wrap break-words text-13 text-black-700">
                  {shop.memo}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}
        <div className="space-y-3 px-4">
          <button
            type="button"
            disabled={isVisitPending || !shop}
            onClick={onVisitToggle}
            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-control border text-15 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:opacity-50 ${
              shop?.isVisited
                ? "border-black-200 bg-white text-black-600 hover:bg-black-50"
                : "border-green-600 bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <CheckIcon className="size-5" aria-hidden="true" />
            {shop?.isVisited ? "방문 완료 취소" : "방문했어요"}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onViewShop}
              className="flex min-h-12 items-center justify-center gap-1 rounded-control bg-black-50 px-3 text-14 font-semibold text-black-700 hover:bg-black-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              상점 보기
              <ChevronRightIcon
                className="size-4 text-black-400"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={onOpenRoute}
              className="flex min-h-12 items-center justify-center gap-1 rounded-control bg-black-50 px-3 text-14 font-semibold text-black-700 hover:bg-black-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              길찾기
              <ChevronRightIcon
                className="size-4 text-black-400"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </BottomSheet.Body>
    </BottomSheet>
  );
}
