"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { Textarea } from "@/components/ui/Textarea/Textarea";

const TAGS = [
  "미니멀",
  "인테리어 소품이 많아요",
  "아기자기해요",
  "선물 사기 좋아요",
  "캐릭터 상품이 많아요",
  "빈티지해요",
] as const;

type ReviewDraft = Readonly<{
  tags: string[];
  review: string;
  images: File[];
}>;

type Props = Readonly<{
  shopId: string;
  shopName: string;
  state?: "success" | "loading" | "error";
  onSubmit?: (draft: ReviewDraft) => void;
  onRetry?: () => void;
}>;

/** Figma의 방문 후기 작성 흐름을 로컬 초안으로 제공합니다. */
export function VisitReviewForm({
  shopId,
  shopName,
  state = "success",
  onSubmit = () => undefined,
  onRetry = () => window.location.reload(),
}: Props) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [review, setReview] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [tagError, setTagError] = useState("");
  const firstTagRef = useRef<HTMLButtonElement>(null);

  const previews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images],
  );

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  if (state === "loading") {
    return <ReviewFormSkeleton />;
  }

  if (state === "error") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
        <p className="text-16 font-semibold">후기 작성 화면을 불러오지 못했어요</p>
        <Button className="mt-4" onClick={onRetry}>다시 시도</Button>
      </main>
    );
  }

  /** 태그 선택을 최대 5개 안에서 전환합니다. */
  const toggleTag = (tag: string) => {
    setTagError("");
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  /** 필수 태그를 검증하고 로컬 초안을 전달합니다. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedTags.length === 0) {
      setTagError("태그를 1개 이상 선택해 주세요.");
      firstTagRef.current?.focus();
      return;
    }
    onSubmit({ tags: selectedTags, review, images });
  };

  return (
    <main className="min-h-dvh bg-white pb-24">
      <header className="sticky top-0 z-10 flex h-[109px] items-end justify-center border-b border-black-100 bg-white px-5 pb-4">
        <Link href={`/shops/${shopId}`} aria-label="상점 상세로 돌아가기" className="absolute bottom-3 left-5 grid size-11 place-items-center rounded-full text-24 focus-visible:outline-2 focus-visible:outline-green-700">‹</Link>
        <h1 className="text-18 font-semibold">후기 작성</h1>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <section className="px-5 py-4">
          <div className="flex items-center gap-2 rounded-[15px] bg-green-100/70 p-3">
            <Image src="/images/shops/shop_example.png" alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
            <div><h2 className="text-14 font-bold">{shopName}</h2><p className="text-12 text-green-700">성수 · 소품샵</p></div>
          </div>
        </section>

        <div className="h-2 bg-black-100" />
        <section className="px-5 py-5" aria-labelledby="tag-title">
          <div className="flex items-center gap-1 text-13 font-bold text-black-500"><h2 id="tag-title">태그 {selectedTags.length}/5</h2><span className="rounded-full bg-black-800 px-2 py-0.5 text-10 text-white">필수</span></div>
          <p className="mt-2 text-11 text-black-400">이 곳에 어울리는 키워드를 골라주세요. (1개 ~ 5개)</p>
          <div className="mt-3 flex flex-wrap gap-2" aria-describedby={tagError ? "tag-error" : undefined}>
            {TAGS.map((tag, index) => {
              const selected = selectedTags.includes(tag);
              return <button key={tag} ref={index === 0 ? firstTagRef : undefined} type="button" aria-pressed={selected} disabled={!selected && selectedTags.length === 5} onClick={() => toggleTag(tag)} className={["min-h-9 rounded-lg border px-3 text-12", selected ? "border-green-500 bg-green-100 text-green-900" : "border-black-300 text-black-500", "disabled:cursor-not-allowed disabled:opacity-40"].join(" ")}>{tag}</button>;
            })}
          </div>
          {tagError ? <p id="tag-error" role="alert" className="mt-2 text-12 text-red-600">{tagError}</p> : null}
        </section>

        <section className="px-5 py-5">
          <h2 className="text-13 font-bold text-black-500">사진 {images.length}/5</h2>
          <p className="mt-2 text-11 text-black-400">첫 번째 사진이 대표 사진으로 표시돼요</p>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            <label className="flex size-24 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black-300 text-11 text-black-400"><span className="text-22">＋</span><span>사진 추가</span><input aria-label="사진 추가" type="file" accept="image/*" multiple className="sr-only" onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 5))} /></label>
            {previews.map(({ file, url }) => <div key={`${file.name}-${file.lastModified}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl"><Image fill unoptimized src={url} alt={`${file.name} 미리보기`} className="object-cover" /><button type="button" aria-label={`${file.name} 삭제`} onClick={() => setImages((current) => current.filter((item) => item !== file))} className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black-950/70 text-14 text-white">×</button></div>)}
          </div>
        </section>

        <section className="px-5 py-5">
          <Textarea value={review} onChange={(event) => setReview(event.target.value)} label="후기" placeholder={`${shopName}에 대한 솔직한 한 줄 후기를 남겨주세요.`} maxLength={300} showCharacterCount textareaClassName="min-h-32 border-0 px-0 focus:ring-0" />
        </section>

        <section className="border-y-8 border-black-100 px-5 py-5 text-13 text-black-500"><h2 className="font-bold">후기 작성 가이드</h2><ul className="mt-4 space-y-3"><li>🍀 실제 방문 경험을 바탕으로 솔직하게 작성해주세요.</li><li>📸 직접 찍은 사진을 첨부하면 다른 픽커들에게 더 도움이 돼요.</li><li>🚫 광고성·비방·개인정보가 포함된 내용은 삭제될 수 있어요.</li></ul></section>
        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[480px] border-t border-black-100 bg-white p-5"><Button type="submit" fullWidth size="large">후기 등록하기</Button></div>
      </form>
    </main>
  );
}

/** 후기 작성 화면의 주요 높이를 유지하는 로딩 상태입니다. */
function ReviewFormSkeleton() {
  return <main aria-busy="true"><Skeleton label="후기 작성 화면을 불러오는 중" className="h-[109px]" /><div className="space-y-5 p-5"><Skeleton announce={false} className="h-16 rounded-2xl" /><Skeleton announce={false} className="h-32 rounded-xl" /><Skeleton announce={false} className="h-40 rounded-xl" /></div></main>;
}
