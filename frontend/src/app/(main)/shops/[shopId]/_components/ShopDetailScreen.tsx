"use client";

import { useShopDetail } from "@/api/shops/shop.query";
import { Button } from "@/components/ui/Button/Button";
import { ShopDetailActions } from "./ShopDetailActions";
import { ShopDetailSkeleton } from "./ShopDetailSkeleton";
import { ShopLocationSection } from "./ShopLocationSection";
import { ShopReviewSection } from "./ShopReviewSection";
import { ShopSummarySection } from "./ShopSummarySection";
import { ShopVisitInfoSection } from "./ShopVisitInfoSection";

type Props = Readonly<{
  shopId: string;
}>;

/** 브라우저에서 로그인 쿠키와 함께 상점 상세 정보를 조회합니다. */
export function ShopDetailScreen({ shopId }: Props) {
  const { data: shop, isPending, isError, refetch } = useShopDetail(shopId);

  if (isPending) {
    return <ShopDetailSkeleton />;
  }

  if (isError || !shop) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
        <p className="text-14 text-black-500">상점 정보를 불러오지 못했어요</p>

        <Button className="mt-4" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </main>
    );
  }

  const imageUrls = shop.images.map((image) => image.imageUrl);

  return (
    <main className="min-h-dvh bg-black-100/40 pb-10">
      <ShopDetailActions
        shopId={shop.id}
        shopName={shop.name}
        shopCategory={shop.category}
        imageUrls={imageUrls}
        initialIsLiked={shop.isLiked}
      />

      <ShopSummarySection shop={shop} />

      <ShopVisitInfoSection shop={shop} />

      <ShopLocationSection shop={shop} />

      <ShopReviewSection shopId={shop.id} visitLogCount={shop.visitLogCount} />
    </main>
  );
}
