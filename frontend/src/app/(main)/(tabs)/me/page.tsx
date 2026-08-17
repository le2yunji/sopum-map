import { MyPageScreen } from "./_components/MyPageScreen";
/** 하단 내비게이션의 마이페이지 경로를 사용자 허브에 연결합니다. */
export default async function Page({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview } = await searchParams;
  return <MyPageScreen isLoggedIn={preview !== "logged-out"} isEmpty={preview === "empty"} />;
}
