import { ShopDetailScreen } from "./_components/ShopDetailScreen";
import { getShopDetailFixture } from "./_data/shop-detail.fixture";

/** 주소의 상점 식별자를 fixture 화면 데이터에 연결합니다. */
export default async function ShopDetailPage({
  params,
}: PageProps<"/shops/[shopId]">) {
  const { shopId } = await params;

  return <ShopDetailScreen shop={getShopDetailFixture(shopId)} />;
}
