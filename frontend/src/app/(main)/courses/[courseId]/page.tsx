import { CourseDetailScreen } from "./_components/CourseDetailScreen";
/** 동적 코스 경로를 상세 화면에 연결합니다. */
export default async function Page({ params }: { params: Promise<{ courseId: string }> }) { const { courseId } = await params; return <CourseDetailScreen courseId={courseId} />; }
