import { PublicCoursesScreen } from "./_components/PublicCoursesScreen";
import { parsePublicCourseSearchParams } from "./_utils/public-course-search-params";

type PublicCoursesPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

/** URL 검색 조건을 검증해 공개 코스 목록 화면을 엽니다. */
export default async function PublicCoursesPage({
  searchParams,
}: PublicCoursesPageProps) {
  const initialQuery = parsePublicCourseSearchParams(await searchParams);

  return <PublicCoursesScreen initialQuery={initialQuery} />;
}
