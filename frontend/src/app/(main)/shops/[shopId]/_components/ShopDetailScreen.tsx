import { ShopDetailData } from "@sopum-map/shared";
import { ShopDetailActions } from "./ShopDetailActions";
import { ShopLocationSection } from "./ShopLocationSection";
import { ShopReviewSection } from "./ShopReviewSection";
import { ShopSummarySection } from "./ShopSummarySection";
import { ShopVisitInfoSection } from "./ShopVisitInfoSection";

type Props = Readonly<{
  shop: ShopDetailData;
}>;

export function ShopDetailScreen({ shop }: Props) {
  const imageUrls = shop.images.map((image) => image.imageUrl);
  return (
    <main className="min-h-dvh bg-black-100/40 pb-10">
      <ShopDetailActions
        shopId={shop.id}
        shopName={shop.name}
        shopCategory={shop.category}
        imageUrls={imageUrls}
        initialIsPicked={shop.isLiked}
      />

      <ShopSummarySection shop={shop} />

      <ShopLocationSection shop={shop} />

      <ShopVisitInfoSection shop={shop} />

      <ShopReviewSection shopId={shop.id} visitLogCount={shop.visitLogCount} />
    </main>
  );
}
