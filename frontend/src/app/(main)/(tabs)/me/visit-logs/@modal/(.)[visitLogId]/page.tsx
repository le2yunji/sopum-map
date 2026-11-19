import { VisitLogDetailRoute } from "../../_components/VisitLogDetailRoute";

type Props = Readonly<{
  params: Promise<{
    visitLogId: string;
  }>;
}>;

/** 피드에서 이동한 방문 로그 상세를 현재 화면 위의 모달로 표시합니다. */
export default async function MyVisitLogDetailModalPage({ params }: Props) {
  const { visitLogId } = await params;

  return <VisitLogDetailRoute visitLogId={visitLogId} mode="modal" />;
}
