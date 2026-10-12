"use client";

import type { CourseDetailShop } from "@sopum-map/shared";

import { ChevronRightIcon } from "@/components/icons";
import { BottomSheet } from "@/components/ui/BottomSheet";

type Props = Readonly<{
  open: boolean;
  shop: CourseDetailShop | null;
  onOpenChange: (open: boolean) => void;
  onViewShop: () => void;
  onOpenRoute: () => void;
}>;

/** 상점 행의 보조 액션을 필요할 때만 보여줍니다. */
export function CourseShopActionSheet({ open, shop, onOpenChange, onViewShop, onOpenRoute }: Props) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} ariaLabelledBy="course-shop-action-title">
      <BottomSheet.Handle />
      <BottomSheet.Header>
        <BottomSheet.Title id="course-shop-action-title">{shop?.name ?? "상점"}</BottomSheet.Title>
      </BottomSheet.Header>
      <BottomSheet.Body className="space-y-1">
        <button type="button" onClick={onViewShop} className="flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-15 font-semibold hover:bg-black-50 focus-visible:outline-2 focus-visible:outline-green-700">
          상점 보기 <ChevronRightIcon className="size-5 text-black-400" aria-hidden="true" />
        </button>
        <button type="button" onClick={onOpenRoute} className="flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-15 font-semibold hover:bg-black-50 focus-visible:outline-2 focus-visible:outline-green-700">
          길찾기 <ChevronRightIcon className="size-5 text-black-400" aria-hidden="true" />
        </button>
      </BottomSheet.Body>
    </BottomSheet>
  );
}
