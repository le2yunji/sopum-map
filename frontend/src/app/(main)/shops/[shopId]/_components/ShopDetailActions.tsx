"use client";

import { useState } from "react";

import { ShopImageCarousel } from "./ShopImageCarousel";
import { ShopPickSheet } from "./ShopPickSheet";
import { ShopReportSheet } from "./ShopReportSheet";

type ShopDetailSheet = "pick" | "report" | null;

type Props = Readonly<{
  shopName: string;
  shopCategory: string;
  imageUrls: readonly string[];
  initialIsLiked?: boolean;
  backHref?: string;
}>;

export function ShopDetailActions({
  shopName,
  shopCategory,
  imageUrls,
  initialIsLiked = false,
  backHref = "/",
}: Props) {
  const [isLiked, setLiked] = useState(initialIsLiked);
  const [sheet, setSheet] = useState<ShopDetailSheet>(null);

  const handleToggleLike = () => {
    setLiked((prev) => !prev);
    setSheet("pick");
  };

  return (
    <>
      <ShopImageCarousel
        shopName={shopName}
        shopCategory={shopCategory}
        imageUrls={imageUrls}
        isLiked={isLiked}
        onToggleLike={handleToggleLike}
        onReport={() => setSheet("report")}
        backHref={backHref}
      />

      <ShopPickSheet
        open={sheet === "pick"}
        onOpenChange={(open) => {
          setSheet(open ? "pick" : null);
        }}
      />

      <ShopReportSheet
        open={sheet === "report"}
        onOpenChange={(open) => {
          setSheet(open ? "report" : null);
        }}
      />
    </>
  );
}
