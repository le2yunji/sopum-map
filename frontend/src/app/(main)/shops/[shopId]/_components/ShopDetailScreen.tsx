"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal/Modal";

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

const REPORT_REASONS = [
  "주소가 달라요",
  "영업시간이 달라요",
  "폐점한 매장이에요",
  "기타",
] as const;

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
  const [isLiked, setIsLiked] = useState(shop?.isLiked ?? false);
  const [pickOpen, setPickOpen] = useState(false);
  const [pickStatus, setPickStatus] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>();
  const [reportCompleteOpen, setReportCompleteOpen] = useState(false);
  const reportTriggerRef = useRef<HTMLButtonElement>(null);

  if (state === "loading") {
    return <ShopDetailLoading />;
  }

  if (state === "error") {
    return <ShopDetailError onRetry={onRetry} />;
  }

  if (!shop) {
    return <ShopDetailEmpty />;
  }

  /** 서버 연결 전에도 찜 결과를 바로 확인할 수 있게 화면 상태를 바꿉니다. */
  function toggleLike() {
    setIsLiked((liked) => !liked);
  }

  /** 선택한 픽 이름을 알리고 선택창을 닫습니다. */
  function addToPick(folderName: string) {
    setPickStatus(`${folderName}에 추가했어요.`);
    setPickOpen(false);
  }

  /** 제보 사유를 확인한 뒤 완료 안내로 전환합니다. */
  function submitReport() {
    setReportOpen(false);
    setReportCompleteOpen(true);
  }

  /** 완료 안내를 닫은 뒤 제보를 시작한 버튼으로 초점을 돌려줍니다. */
  function changeReportCompleteOpen(open: boolean) {
    setReportCompleteOpen(open);
    if (!open) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => reportTriggerRef.current?.focus());
      });
    }
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
            <button ref={reportTriggerRef} type="button" aria-label="상점 정보 수정 제보" onClick={() => setReportOpen(true)} className="grid size-11 place-items-center rounded-full bg-white/95 text-14 font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-green-500">!</button>
            <button type="button" aria-label={isLiked ? "찜 해제" : "찜하기"} aria-pressed={isLiked} onClick={toggleLike} className="grid size-11 place-items-center rounded-full bg-white/95 text-20 shadow-sm focus-visible:outline-2 focus-visible:outline-green-500">{isLiked ? "♥" : "♡"}</button>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-center gap-2">
          <Badge>{shop.categoryLabel}</Badge>
          <span className="text-12 text-black-500">찜 {shop.likeCount + (isLiked ? 1 : 0)}</span>
        </div>
        <h1 className="mt-3 text-24 font-bold tracking-[-0.02em]">{shop.name}</h1>
        {shop.description ? <p className="mt-3 text-14 leading-6 text-black-800">{shop.description}</p> : null}
        <div aria-label="상점 태그" className="mt-4 flex flex-wrap gap-2">
          {shop.tags.length > 0 ? shop.tags.map((tag) => <Badge key={tag} variant="pink">#{tag}</Badge>) : <span className="text-12 text-black-500">등록된 태그가 없어요.</span>}
        </div>

        <Button fullWidth className="mt-6" onClick={() => setPickOpen(true)}>내 픽에 추가</Button>
        {pickStatus ? <p role="status" className="mt-3 text-center text-12 text-green-700">{pickStatus}</p> : null}
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
        <button type="button" onClick={() => setReportOpen(true)} className="mt-4 min-h-11 w-full text-14 text-black-500 underline underline-offset-4">상점 정보 수정 제보</button>
      </section>

      <BottomSheet open={pickOpen} onOpenChange={setPickOpen} ariaLabelledBy="pick-sheet-title" showCloseButton>
        <BottomSheet.Handle />
        <BottomSheet.Header><BottomSheet.Title id="pick-sheet-title">내 픽에 추가</BottomSheet.Title></BottomSheet.Header>
        <BottomSheet.Body>
          <div className="space-y-2">
            {shop.pickFolders.map((folder) => (
              <button key={folder.id} type="button" aria-label={`${folder.name}, 상점 ${folder.shopCount}개`} onClick={() => addToPick(folder.name)} className="flex min-h-14 w-full items-center justify-between rounded-xl border border-black-200 px-4 text-left text-14 focus-visible:outline-2 focus-visible:outline-green-500">
                <span className="font-semibold">{folder.name}</span><span className="text-black-500">상점 {folder.shopCount}개</span>
              </button>
            ))}
          </div>
        </BottomSheet.Body>
      </BottomSheet>

      <BottomSheet open={reportOpen} onOpenChange={setReportOpen} ariaLabelledBy="report-sheet-title" showCloseButton>
        <BottomSheet.Handle />
        <BottomSheet.Header><BottomSheet.Title id="report-sheet-title">어떤 정보가 잘못되었나요?</BottomSheet.Title></BottomSheet.Header>
        <BottomSheet.Body>
          <fieldset className="space-y-2">
            <legend className="sr-only">수정할 정보 선택</legend>
            {REPORT_REASONS.map((reason) => (
              <label key={reason} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-black-200 px-4 text-14">
                <input type="radio" name="report-reason" value={reason} checked={reportReason === reason} onChange={() => setReportReason(reason)} className="size-5 accent-green-500" />
                {reason}
              </label>
            ))}
          </fieldset>
        </BottomSheet.Body>
        <BottomSheet.Footer><Button fullWidth disabled={!reportReason} onClick={submitReport}>다음</Button></BottomSheet.Footer>
      </BottomSheet>

      <Modal open={reportCompleteOpen} onOpenChange={changeReportCompleteOpen} ariaLabelledBy="report-complete-title" ariaDescribedBy="report-complete-description">
        <Modal.Header><span aria-hidden="true" className="text-24 text-green-500">✓</span><Modal.Title id="report-complete-title">제보가 완료되었습니다</Modal.Title></Modal.Header>
        <Modal.Body id="report-complete-description">확인한 뒤 상점 정보에 반영할게요.</Modal.Body>
        <Modal.Footer><Button fullWidth onClick={() => changeReportCompleteOpen(false)}>닫기</Button></Modal.Footer>
      </Modal>
    </main>
  );
}
