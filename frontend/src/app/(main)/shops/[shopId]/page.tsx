import { SHOP_DETAIL_FIXTURE } from "./_data/shop-detail.fixture";
import { ShopDetailScreen } from "./_components/ShopDetailScreen";

/** 동적 상점 식별자를 fixture 표시 모델에 반영합니다. */
export default async function ShopDetailPage({ params }: PageProps<"/shops/[shopId]">) {
  const { shopId } = await params;
  const shop = { ...SHOP_DETAIL_FIXTURE, id: shopId };

  return <ShopDetailScreen shop={shop} />;
}
