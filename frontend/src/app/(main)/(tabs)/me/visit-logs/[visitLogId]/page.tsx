import { VisitLogDetailRoute } from "../_components/VisitLogDetailRoute";

type Props = Readonly<{
  params: Promise<{
    visitLogId: string;
  }>;
}>;

/** 직접 접속하거나 새로고침한 방문 로그 상세를 페이지로 표시합니다. */
export default async function MyVisitLogDetailPage({ params }: Props) {
  const { visitLogId } = await params;

  return <VisitLogDetailRoute visitLogId={visitLogId} mode="page" />;
}
