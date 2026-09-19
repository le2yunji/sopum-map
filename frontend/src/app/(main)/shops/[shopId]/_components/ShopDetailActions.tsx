"use client";

import { useState } from "react";

import { PickAction } from "@/components/pick/PickAction";

import { ShopImageCarousel } from "./ShopImageCarousel";
import { ShopReportSheet } from "./ShopReportSheet";

type Props = Readonly<{
  shopId: string;
  shopName: string;
  shopCategory: string;
  imageUrls: readonly string[];
  initialIsLiked?: boolean;
}>;

export function ShopDetailActions({
  shopId,
  shopName,
  shopCategory,
  imageUrls,
  initialIsLiked = false,
}: Props) {
  const [isReportSheetOpen, setReportSheetOpen] = useState(false);

  return (
    <>
      <PickAction shopId={shopId} initialIsLiked={initialIsLiked}>
        {({ isLiked, isPending, onToggle }) => (
          <ShopImageCarousel
            shopName={shopName}
            shopCategory={shopCategory}
            imageUrls={imageUrls}
            isLikePending={isPending}
            isLiked={isLiked}
            onToggleLike={onToggle}
            onReport={() => setReportSheetOpen(true)}
          />
        )}
      </PickAction>

      <ShopReportSheet
        open={isReportSheetOpen}
        onOpenChange={setReportSheetOpen}
      />
    </>
  );
}
