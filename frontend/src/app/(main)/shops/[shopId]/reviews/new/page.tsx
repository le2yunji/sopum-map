import { VisitReviewForm } from "./_components/VisitReviewForm";

/** 동적 상점 식별자를 후기 작성 화면에 연결합니다. */
export default async function Page({ params }: PageProps<"/shops/[shopId]/reviews/new">) {
  const { shopId } = await params;
  return <VisitReviewForm shopId={shopId} shopName="모모 소품샵" />;
}
