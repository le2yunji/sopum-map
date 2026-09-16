// (main)/shops/[shopId]/page.tsx

import { ShopDetailScreen } from "./_components/ShopDetailScreen";
import { getShopDetail } from "@/api/shops/shop.api";

type Props = Readonly<{
  params: Promise<{
    shopId: string;
  }>;
}>;

export default async function ShopDetailPage({ params }: Props) {
  const { shopId } = await params;
  const shop = await getShopDetail(shopId);

  return <ShopDetailScreen shop={shop} />;
}
