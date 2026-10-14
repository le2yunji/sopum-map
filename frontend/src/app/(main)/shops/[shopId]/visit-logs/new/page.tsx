import { VisitLogCreateScreen } from "./_components/VisitLogCreateScreen";

/** 동적 상점 식별자를 방문 로그 작성 화면에 연결합니다. */
export default async function Page({
  params,
}: PageProps<"/shops/[shopId]/visit-logs/new">) {
  const { shopId } = await params;

  return <VisitLogCreateScreen shopId={shopId} />;
}
