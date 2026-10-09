import { CourseEditScreen } from "./_components/CourseEditScreen";

type Props = Readonly<{
  params: Promise<{
    courseId: string;
  }>;
}>;

export default async function CourseEditPage({ params }: Props) {
  const { courseId } = await params;

  return <CourseEditScreen courseId={courseId} />;
}
