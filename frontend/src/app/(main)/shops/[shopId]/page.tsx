// (main)/shops/[shopId]/page.tsx

import { ShopDetailScreen } from "./_components/ShopDetailScreen";

type Props = Readonly<{
  params: Promise<{
    shopId: string;
  }>;
}>;

export default async function ShopDetailPage({ params }: Props) {
  const { shopId } = await params;

  return <ShopDetailScreen shopId={shopId} />;
}
