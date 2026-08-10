import { VisitLogFormScreen } from "./_components/VisitLogFormScreen";

/** 주소의 상점 식별자를 후기 작성 화면에 전달합니다. */
export default async function VisitLogPage({ params }: PageProps<"/shops/[shopId]/reviews/new">) {
  const { shopId } = await params;
  return <VisitLogFormScreen shopId={shopId} shopName="행운상점 연남" />;
}
