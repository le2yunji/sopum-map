import { VisitLogEditScreen } from "./_components/VisitLogEditScreen";

type Props = Readonly<{ params: Promise<{ visitLogId: string }> }>;

/** 동적 로그 식별자를 본인 방문 로그 수정 화면에 연결합니다. */
export default async function VisitLogEditPage({ params }: Props) {
  const { visitLogId } = await params;
  return <VisitLogEditScreen visitLogId={visitLogId} />;
}
