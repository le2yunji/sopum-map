// (main)/shops/[shopId]/page.tsx

import { SHOP_DETAIL_FIXTURE } from "./_data/shop-detail.fixture";
import { ShopDetailScreen } from "./_components/ShopDetailScreen";

type Props = Readonly<{
  params: Promise<{
    shopId: string;
  }>;
}>;

export default async function ShopDetailPage({ params }: Props) {
  const { shopId } = await params;
  const shop = { ...SHOP_DETAIL_FIXTURE, id: shopId };

  return <ShopDetailScreen shop={shop} />;
}
