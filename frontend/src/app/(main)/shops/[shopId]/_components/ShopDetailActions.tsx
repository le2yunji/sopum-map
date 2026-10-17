"use client";

import { useEffect, useState, type ReactNode } from "react";

import { PickAction } from "@/components/pick/PickAction";
import { Snackbar } from "@/components/ui/Snackbar";

import { ShopImageCarousel } from "./ShopImageCarousel";
import { ShopReportSheet } from "./ShopReportSheet";

type Props = Readonly<{
  shopId: string;
  shopName: string;
  shopCategory: string;
  imageUrls: readonly string[];
  initialIsLiked?: boolean;
  children: (props: {
    isLiked: boolean;
    isPending: boolean;
    onToggle: () => void;
  }) => ReactNode;
}>;

export function ShopDetailActions({
  shopId,
  shopName,
  shopCategory,
  imageUrls,
  initialIsLiked = false,
  children,
}: Props) {
  const [isReportSheetOpen, setReportSheetOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!shareNotice) {
      return;
    }

    const timer = window.setTimeout(() => setShareNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [shareNotice]);

  /** 기기 공유창을 우선 사용하고 지원하지 않으면 링크를 복사합니다. */
  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: shopName, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareNotice("상점 링크를 복사했어요.");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setShareNotice("상점 링크를 복사했어요.");
      } catch {
        setShareNotice("상점 링크를 공유하지 못했어요.");
      }
    }
  };

  return (
    <>
      <PickAction shopId={shopId} initialIsLiked={initialIsLiked}>
        {({ isLiked, isPending, onToggle }) => (
          <>
            <ShopImageCarousel
              shopName={shopName}
              shopCategory={shopCategory}
              imageUrls={imageUrls}
              onShare={() => void handleShare()}
              onReport={() => setReportSheetOpen(true)}
            />
            {children({ isLiked, isPending, onToggle })}
          </>
        )}
      </PickAction>

      <ShopReportSheet
        open={isReportSheetOpen}
        onOpenChange={setReportSheetOpen}
      />
      <Snackbar open={shareNotice !== null} message={shareNotice} />
    </>
  );
}
