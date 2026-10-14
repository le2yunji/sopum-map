import { redirect } from "next/navigation";

/** 이전 후기 작성 주소를 방문 로그 작성 주소로 교체 이동합니다. */
export default async function Page({
  params,
}: PageProps<"/shops/[shopId]/visit-logs/new">) {
  const { shopId } = await params;

  redirect(`/shops/${shopId}/visit-logs/new`);
}
