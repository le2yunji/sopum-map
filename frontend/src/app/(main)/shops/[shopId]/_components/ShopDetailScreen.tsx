import type { ShopDetailView } from "../_types/shop-detail.types";
import { ShopDetailActions } from "./ShopDetailActions";
import { ShopLocationSection } from "./ShopLocationSection";
import { ShopReviewSection } from "./ShopReviewSection";
import { ShopSummarySection } from "./ShopSummarySection";
import { ShopVisitInfoSection } from "./ShopVisitInfoSection";

type Props = Readonly<{
  shop: ShopDetailView;
  onRetry?: () => void;
  onDirections?: () => void;
  onSmartStore?: () => void;
}>;

export function ShopDetailScreen({ shop }: Props) {
  return (
    <main className="min-h-dvh bg-black-100/40 pb-10">
      <ShopDetailActions
        shopName={shop.name}
        shopCategory={shop.category}
        imageUrls={shop.imageUrls}
      />
      <ShopSummarySection shop={shop} />

      <ShopLocationSection shop={shop} />

      <ShopVisitInfoSection shop={shop} />

      <ShopReviewSection shop={shop} />
    </main>
  );
}
