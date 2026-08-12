"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

import type { ShopDetailView, ShopDetailViewState } from "../_types/shop-detail.types";

type Props = Readonly<{
  shop: ShopDetailView;
  state?: ShopDetailViewState;
  onRetry?: () => void;
}>;
const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";

/** Figma의 상점 상세 흐름과 로컬 상호작용을 한 화면에 제공합니다. */
export function ShopDetailScreen({
  shop,
  state = "success",
  onRetry = () => window.location.reload(),
}: Props) {
  const [imageIndex, setImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [sheet, setSheet] = useState<"pick" | "report" | null>(null);
  const [folder, setFolder] = useState("");
  const [pickMessage, setPickMessage] = useState("");
  const [reason, setReason] = useState("");
  const [reported, setReported] = useState(false);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  if (state === "loading") return <ShopDetailSkeleton />;
  if (state === "error") {
    return (
      <StatePanel
        title="상점 정보를 불러오지 못했어요"
        action="다시 시도"
        onAction={onRetry}
      />
    );
  }

  const imageUrls = shop.imageUrls.length > 0 ? shop.imageUrls : [DEFAULT_SHOP_IMAGE];
  const imageUrl = heroImageFailed
    ? DEFAULT_SHOP_IMAGE
    : (imageUrls[imageIndex] ?? DEFAULT_SHOP_IMAGE);

  /** 제보 시트를 닫을 때 다음 방문을 위한 입력 상태를 초기화합니다. */
  const closeReport = () => { setSheet(null); setReason(""); setReported(false); };

  return (
    <main className="min-h-dvh bg-black-100 pb-10">
      <section className="relative h-[318px] bg-black-300" aria-label="상점 이미지">
        <Image fill loading="eager" src={imageUrl} alt={`${shop.name} 매장 전경`} sizes="(max-width: 480px) 100vw, 480px" className="object-cover" onError={() => setHeroImageFailed(true)} />
        <div className="absolute inset-x-4 top-5 flex justify-between">
          <Link href="/" aria-label="뒤로가기" className="grid size-11 place-items-center rounded-full bg-white/90 text-20 focus-visible:outline-2 focus-visible:outline-green-700">←</Link>
          <div className="flex gap-2">
            <button type="button" aria-pressed={liked} aria-label={liked ? "좋아요 취소" : "좋아요 추가"} onClick={() => setLiked(!liked)} className="grid size-11 place-items-center rounded-full bg-white/90 text-20 focus-visible:outline-2 focus-visible:outline-green-700">{liked ? "♥" : "♡"}</button>
            <button type="button" aria-label="정보 수정 제보" onClick={() => setSheet("report")} className="grid size-11 place-items-center rounded-full bg-white/90 text-18 focus-visible:outline-2 focus-visible:outline-green-700">✎</button>
          </div>
        </div>
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-12">
          <button type="button" aria-label="이전 이미지" onClick={() => { setHeroImageFailed(false); setImageIndex((imageIndex - 1 + imageUrls.length) % imageUrls.length); }} className="grid size-11 place-items-center rounded-full bg-white/90">‹</button>
          <span className="rounded-full bg-black-950/60 px-3 py-1 text-white">{imageIndex + 1} / {imageUrls.length}</span>
          <button type="button" aria-label="다음 이미지" onClick={() => { setHeroImageFailed(false); setImageIndex((imageIndex + 1) % imageUrls.length); }} className="grid size-11 place-items-center rounded-full bg-white/90">›</button>
        </div>
      </section>

      <div className="-mt-5 relative rounded-t-[20px] bg-white px-5 pt-5 pb-6">
        <div className="flex items-start justify-between gap-3"><div><h1 className="text-20 font-semibold">{shop.name}</h1><p className="mt-1 text-12 text-black-500">⌖ {shop.distance}</p></div><Badge>{shop.category}</Badge></div>
        <div className="mt-3 flex flex-wrap gap-2">{shop.tags.map((tag) => <Badge key={tag} variant="pink">#{tag}</Badge>)}</div>
        <div className="mt-5 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setSheet("pick")}>내 픽에 추가</Button><Link href={`/shops/${shop.id}/reviews/new`} className="flex min-h-11 items-center justify-center rounded-xl border border-pink-300/30 text-14 font-semibold">방문 후기 작성</Link></div>
        {pickMessage ? <p role="status" className="mt-3 text-center text-13 text-green-800">{pickMessage}</p> : null}
      </div>

      <section aria-label="상점 위치" className="mt-2 bg-white px-5 py-6"><h2 className="text-16 font-semibold">위치</h2><div className="relative mt-3 aspect-[345/176] overflow-hidden rounded-xl bg-green-100"><Image fill src={shop.mapImageUrl ?? "/images/shops/shop_example.png"} alt={`${shop.name} 위치 지도`} className="object-cover" sizes="(max-width: 480px) calc(100vw - 40px), 440px" /></div><p className="mt-2 text-12 text-black-500">{shop.address}</p></section>
      <section className="mt-2 bg-white px-5 py-6"><h2 className="text-16 font-semibold">방문 정보</h2><dl className="mt-4 space-y-3 text-13"><div className="flex"><dt className="w-20 text-black-500">영업시간</dt><dd className="font-semibold">{shop.hours}</dd></div>{shop.closedDay ? <div className="flex"><dt className="w-20 text-black-500">휴무일</dt><dd>{shop.closedDay}</dd></div> : null}</dl></section>
      <section className="mt-2 bg-white px-5 py-6"><div className="flex items-center justify-between"><h2 className="text-16 font-semibold">후기 {shop.reviewCount}개</h2><span className="text-12 text-green-700">♡ {shop.likeCount}</span></div>{shop.reviews.length === 0 ? <StatePanel title="아직 등록된 방문 후기가 없어요" /> : <div className="mt-5 space-y-7">{shop.reviews.map((review) => <article key={review.id}><div className="flex items-center gap-2"><Image width={32} height={32} src={review.avatarUrl} alt="" className="rounded-full" /><div><h3 className="text-13 font-semibold">{review.author}</h3><p className="text-10 text-black-400">{review.date}</p></div></div>{review.imageUrls.length ? <div className="mt-3 grid grid-cols-2 gap-2">{review.imageUrls.map((url) => <div key={url} className="relative aspect-[3/2] overflow-hidden rounded-lg"><Image fill src={url} alt={`${review.author}님의 방문 사진`} className="object-cover" sizes="200px" /></div>)}</div> : null}<p className="mt-3 text-13 leading-5 text-black-800">{review.content}</p></article>)}</div>}</section>

      <BottomSheet open={sheet === "pick"} onOpenChange={(open) => setSheet(open ? "pick" : null)} ariaLabelledBy="pick-title"><BottomSheet.Handle /><BottomSheet.Header><BottomSheet.Title id="pick-title">내 픽 폴더 선택</BottomSheet.Title></BottomSheet.Header><BottomSheet.Body><fieldset className="space-y-3"><legend className="sr-only">폴더 선택</legend>{["성수 나들이", "선물 후보", "꼭 가볼 곳"].map((name) => <label key={name} className="flex min-h-11 items-center gap-3"><input type="radio" name="folder" checked={folder === name} onChange={() => setFolder(name)} /><span>{name}</span></label>)}</fieldset></BottomSheet.Body><BottomSheet.Footer><Button fullWidth disabled={!folder} onClick={() => { setPickMessage(`${folder}에 담았어요`); setSheet(null); }}>폴더에 담기</Button></BottomSheet.Footer></BottomSheet>
      <BottomSheet open={sheet === "report"} onOpenChange={(open) => open ? setSheet("report") : closeReport()} ariaLabel="정보 수정 제보">{reported ? <div role="status" aria-label="제보가 접수되었어요" className="py-8 text-center"><span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-green-100 text-24 text-green-700">✓</span><h2 className="mt-4 text-20 font-semibold">제보가 접수되었어요</h2><p className="mt-2 text-13 text-black-500">확인 후 상점 정보에 반영할게요.</p><Button fullWidth className="mt-6" onClick={closeReport}>닫기</Button></div> : <><BottomSheet.Handle /><BottomSheet.Header><BottomSheet.Title>어떤 정보가 잘못되었나요?</BottomSheet.Title></BottomSheet.Header><BottomSheet.Body><fieldset className="space-y-3"><legend className="sr-only">제보 사유 선택</legend>{["주소가 달라요", "영업시간이 달라요", "폐점한 매장이에요"].map((name) => <label key={name} className="flex min-h-11 items-center gap-3"><input type="radio" name="reason" checked={reason === name} onChange={() => setReason(name)} /><span>{name}</span></label>)}</fieldset></BottomSheet.Body><BottomSheet.Footer><Button fullWidth disabled={!reason} onClick={() => setReported(true)}>제보하기</Button></BottomSheet.Footer></>}</BottomSheet>
    </main>
  );
}

/** 상점 상세의 레이아웃을 유지하는 로딩 화면입니다. */
export function ShopDetailSkeleton() { return <main aria-busy="true"><Skeleton label="상점 정보를 불러오는 중" className="h-[318px]" /><div className="space-y-3 p-5"><Skeleton announce={false} className="h-7 w-40 rounded" /><Skeleton announce={false} className="h-4 w-56 rounded" /><Skeleton announce={false} className="h-44 rounded-xl" /></div></main>; }

/** 빈 상태와 오류 상태에서 다음 행동을 안내합니다. */
function StatePanel({ title, action, onAction }: Readonly<{ title: string; action?: string; onAction?: () => void }>) { return <div className="py-10 text-center"><p className="text-14 text-black-500">{title}</p>{action ? <Button className="mt-4" onClick={onAction}>{action}</Button> : null}</div>; }
