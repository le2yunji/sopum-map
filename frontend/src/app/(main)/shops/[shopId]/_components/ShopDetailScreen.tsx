"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button";

import type {
  ShopDetailView,
  ShopDetailViewState,
} from "../_types/shop-detail.types";
import { ShopImageGallery } from "./ShopImageGallery";

type ShopDetailScreenProps = Readonly<{
  shop?: ShopDetailView;
  state?: ShopDetailViewState;
  onRetry?: () => void;
}>;

/** 최종 상세 화면과 비슷한 높이를 유지하는 로딩 상태를 표시합니다. */
function ShopDetailLoading() {
  return (
    <main aria-busy="true" aria-label="상점 정보를 불러오는 중" className="min-h-dvh bg-white">
      <div className="aspect-[4/3] animate-pulse bg-black-100 motion-reduce:animate-none" />
      <div className="space-y-4 px-5 py-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-black-100 motion-reduce:animate-none" />
        <div className="h-20 animate-pulse rounded-xl bg-black-100 motion-reduce:animate-none" />
        <div className="h-40 animate-pulse rounded-xl bg-black-100 motion-reduce:animate-none" />
      </div>
    </main>
  );
}

/** 상세 정보를 표시할 수 없을 때 복구 행동을 제공합니다. */
function ShopDetailError({ onRetry }: Pick<ShopDetailScreenProps, "onRetry">) {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p aria-hidden="true" className="text-24 text-green-500">♧</p>
        <h1 className="mt-3 text-20 font-semibold">상점 정보를 불러오지 못했어요</h1>
        <p className="mt-2 text-14 text-black-500">잠시 후 다시 확인해 주세요.</p>
        <Button className="mt-6" onClick={onRetry}>다시 시도</Button>
      </div>
    </main>
  );
}

/** 찾을 수 없는 상점에서 탐색 화면으로 돌아가는 동선을 제공합니다. */
function ShopDetailEmpty() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p aria-hidden="true" className="text-24 text-green-500">⌖</p>
        <h1 className="mt-3 text-20 font-semibold">상점 정보를 찾을 수 없어요</h1>
        <p className="mt-2 text-14 text-black-500">다른 소품샵을 둘러보세요.</p>
        <Link href="/map" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-green-500 px-5 text-14 font-semibold text-white focus-visible:outline-2 focus-visible:outline-green-700">
          지도로 이동
        </Link>
      </div>
    </main>
  );
}

/** 상점 연락처와 영업 정보를 읽기 쉬운 행으로 표시합니다. */
function ShopInfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-3 py-3 text-14">
      <dt className="font-medium text-black-500">{label}</dt>
      <dd className="min-w-0 text-black-900">{value}</dd>
    </div>
  );
}

/** fixture 상점 정보와 이후 기능으로 이어지는 상세 허브를 표시합니다. */
export function ShopDetailScreen({
  shop,
  state = "success",
  onRetry,
}: ShopDetailScreenProps) {
  if (state === "loading") {
    return <ShopDetailLoading />;
  }

  if (state === "error") {
    return <ShopDetailError onRetry={onRetry} />;
  }

  if (!shop) {
    return <ShopDetailEmpty />;
  }

  return (
    <main className="min-h-dvh bg-white pb-10 text-black-950">
      <div className="relative">
        <ShopImageGallery images={shop.images} shopName={shop.name} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black-950/45 to-transparent px-4 pb-8 pt-4">
          <Link href="/map" aria-label="지도로 돌아가기" className="grid size-11 place-items-center rounded-full bg-white/95 text-20 shadow-sm focus-visible:outline-2 focus-visible:outline-green-500">
            ←
          </Link>
          <div className="flex gap-2">
            <button type="button" aria-label="상점 정보 수정 제보" className="grid size-11 place-items-center rounded-full bg-white/95 text-14 font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-green-500">!</button>
            <button type="button" aria-label={shop.isLiked ? "찜 해제" : "찜하기"} aria-pressed={shop.isLiked} className="grid size-11 place-items-center rounded-full bg-white/95 text-20 shadow-sm focus-visible:outline-2 focus-visible:outline-green-500">♡</button>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-center gap-2">
          <Badge>{shop.categoryLabel}</Badge>
          <span className="text-12 text-black-500">찜 {shop.likeCount}</span>
        </div>
        <h1 className="mt-3 text-24 font-bold tracking-[-0.02em]">{shop.name}</h1>
        {shop.description ? <p className="mt-3 text-14 leading-6 text-black-800">{shop.description}</p> : null}
        <div aria-label="상점 태그" className="mt-4 flex flex-wrap gap-2">
          {shop.tags.length > 0 ? shop.tags.map((tag) => <Badge key={tag} variant="pink">#{tag}</Badge>) : <span className="text-12 text-black-500">등록된 태그가 없어요.</span>}
        </div>

        <Button fullWidth className="mt-6">내 픽에 추가</Button>
      </div>

      <section aria-labelledby="shop-info-title" className="mt-8 border-t-8 border-black-100 px-5 pt-7">
        <h2 id="shop-info-title" className="text-18 font-semibold">상점 정보</h2>
        <dl className="mt-3 divide-y divide-black-100">
          <ShopInfoRow label="주소" value={shop.address} />
          <ShopInfoRow label="영업시간" value={shop.openingHours ?? "등록된 영업시간이 없어요."} />
          <ShopInfoRow label="전화" value={shop.phone ?? "등록된 전화번호가 없어요."} />
        </dl>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {shop.instagramUrl ? <a href={shop.instagramUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center rounded-xl border border-black-300 text-14 font-semibold focus-visible:outline-2 focus-visible:outline-green-500">인스타그램 열기</a> : null}
          {shop.naverMapUrl ? <a href={shop.naverMapUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center rounded-xl bg-green-500 text-14 font-semibold text-white focus-visible:outline-2 focus-visible:outline-green-700">네이버 지도에서 보기</a> : null}
        </div>
      </section>

      <section aria-labelledby="shop-location-title" className="mt-8 border-t-8 border-black-100 px-5 pt-7">
        <h2 id="shop-location-title" className="text-18 font-semibold">위치</h2>
        <div className="mt-4 grid h-36 place-items-center rounded-2xl bg-green-50 text-center">
          <div><span aria-hidden="true" className="text-24 text-green-700">⌖</span><p className="mt-2 text-14 text-black-800">{shop.locationLabel}</p></div>
        </div>
      </section>

      <section aria-labelledby="shop-reviews-title" className="mt-8 border-t-8 border-black-100 px-5 pt-7">
        <div className="flex items-center justify-between gap-4">
          <div><h2 id="shop-reviews-title" className="text-18 font-semibold">방문 후기</h2><p className="mt-1 text-12 text-black-500">다녀온 사람들의 작은 기록이에요.</p></div>
          <Link href={`/shops/${shop.id}/reviews/new`} className="shrink-0 text-14 font-semibold text-green-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-green-500">방문 후기 작성</Link>
        </div>
        {shop.reviews.length > 0 ? (
          <ul className="mt-5 divide-y divide-black-100">
            {shop.reviews.map((review) => (
              <li key={review.id} className="py-5 first:pt-0">
                <div className="flex items-center justify-between gap-3 text-12"><span className="font-semibold text-black-900">{review.authorName}</span><time className="text-black-400">{review.visitedAt}</time></div>
                <p className="mt-2 text-14 leading-6 text-black-800">{review.content}</p>
                <div className="mt-3 flex flex-wrap gap-2">{review.tags.map((tag) => <Badge key={tag}>#{tag}</Badge>)}</div>
              </li>
            ))}
          </ul>
        ) : <p className="mt-5 rounded-2xl bg-green-50 px-4 py-8 text-center text-14 text-black-700">첫 방문 후기를 남겨 주세요.</p>}
        <button type="button" className="mt-4 min-h-11 w-full text-14 text-black-500 underline underline-offset-4">상점 정보 수정 제보</button>
      </section>
    </main>
  );
}
