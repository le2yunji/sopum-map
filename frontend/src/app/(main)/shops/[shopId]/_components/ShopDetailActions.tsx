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
  initialIsPicked?: boolean;
  backHref?: string;
}>;

export function ShopDetailActions({
  shopId,
  shopName,
  shopCategory,
  imageUrls,
  initialIsPicked = false,
  backHref = "/",
}: Props) {
  const [isReportSheetOpen, setReportSheetOpen] = useState(false);

  return (
    <>
      <PickAction shopId={shopId} initialIsPicked={initialIsPicked}>
        {({ isPicked, onToggle }) => (
          <ShopImageCarousel
            shopName={shopName}
            shopCategory={shopCategory}
            imageUrls={imageUrls}
            isLiked={isPicked}
            onToggleLike={onToggle}
            onReport={() => setReportSheetOpen(true)}
            backHref={backHref}
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
