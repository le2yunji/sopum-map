import { CourseDetailScreen } from "./_components/CourseDetailScreen";

type Props = Readonly<{
  params: Promise<{
    courseId: string;
  }>;
}>;

export default async function CourseDetailPage({ params }: Props) {
  const { courseId } = await params;

  return <CourseDetailScreen courseId={courseId} />;
}
