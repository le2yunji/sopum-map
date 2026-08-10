"use client";

import Image from "next/image";
import Link from "next/link";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

const VISIT_TAGS = ["친절해요", "구경하기 좋아요", "선물이 많아요", "다시 가고 싶어요"] as const;

type FormState = "success" | "loading" | "error";
type Preview = Readonly<{ name: string; url: string }>;
export type VisitLogDraft = Readonly<{
  visitedAt: string;
  tags: readonly string[];
  content: string;
  photos: readonly File[];
}>;

type VisitLogFormScreenProps = Readonly<{
  shopId: string;
  shopName: string;
  state?: FormState;
  onRetry?: () => void;
  onSubmit?: (draft: VisitLogDraft) => void;
}>;

/** 최종 폼과 비슷한 높이를 유지하며 준비 상태를 알립니다. */
function VisitLogLoading() {
  return <main aria-busy="true" aria-label="후기 작성 화면을 불러오는 중" className="min-h-dvh animate-pulse bg-white px-5 py-6 motion-reduce:animate-none"><div className="h-8 w-40 rounded-lg bg-black-100" /><div className="mt-8 h-24 rounded-2xl bg-black-100" /><div className="mt-6 h-72 rounded-2xl bg-black-100" /></main>;
}

/** 불러오기 실패에서 같은 화면을 다시 요청할 수 있게 합니다. */
function VisitLogError({ onRetry }: Pick<VisitLogFormScreenProps, "onRetry">) {
  return <main className="grid min-h-dvh place-items-center px-5 text-center"><div><h1 className="text-20 font-semibold">후기 작성 화면을 불러오지 못했어요</h1><p className="mt-2 text-14 text-black-500">잠시 후 다시 확인해 주세요.</p><Button className="mt-6" onClick={onRetry}>다시 시도</Button></div></main>;
}

/** 방문 기록에 필요한 입력과 브라우저 미리보기를 한 흐름으로 제공합니다. */
export function VisitLogFormScreen({ shopId, shopName, state = "success", onRetry, onSubmit }: VisitLogFormScreenProps) {
  const [visitedAt, setVisitedAt] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);

  if (state === "loading") return <VisitLogLoading />;
  if (state === "error") return <VisitLogError onRetry={onRetry} />;

  const dateError = showErrors && !visitedAt;
  const tagError = showErrors && selectedTags.length === 0;
  const contentError = showErrors && !content.trim();

  /** 같은 태그를 다시 누르면 선택을 해제할 수 있게 전환합니다. */
  function toggleTag(tag: string) {
    setSelectedTags((tags) => tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]);
  }

  /** 브라우저에서 선택한 이미지 세 장까지만 로컬 미리보기로 만듭니다. */
  function changePhotos(event: ChangeEvent<HTMLInputElement>) {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    const nextPhotos = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/")).slice(0, 3);
    setPhotos(nextPhotos);
    setPreviews(nextPhotos.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })));
  }

  /** 선택한 사진과 주소를 함께 제거해 브라우저 메모리를 정리합니다. */
  function removePhoto(index: number) {
    URL.revokeObjectURL(previews[index].url);
    setPhotos((items) => items.filter((_, itemIndex) => itemIndex !== index));
    setPreviews((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  /** 필수 입력을 확인하고 첫 오류로 초점을 보내거나 로컬 제출을 완료합니다. */
  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!visitedAt || selectedTags.length === 0 || !content.trim()) {
      setShowErrors(true);
      if (!visitedAt) dateRef.current?.focus();
      return;
    }
    onSubmit?.({ visitedAt, tags: selectedTags, content: content.trim(), photos });
    setSubmitted(true);
  }

  return (
    <main className="min-h-dvh bg-white pb-[max(24px,env(safe-area-inset-bottom))] text-black-950">
      <header className="flex min-h-16 items-center justify-between border-b border-black-100 px-5"><Link href={`/shops/${shopId}`} aria-label="후기 작성을 취소하고 상점으로 돌아가기" className="grid size-11 place-items-center text-20 focus-visible:outline-2 focus-visible:outline-green-500">←</Link><h1 className="text-18 font-semibold">방문 후기 작성</h1><span className="size-11" /></header>
      <form noValidate onSubmit={submitForm} className="px-5 py-6">
        <section aria-label="후기를 작성할 상점" className="flex items-center gap-4 rounded-2xl bg-green-50 p-4"><div className="relative size-16 shrink-0 overflow-hidden rounded-xl"><Image src="/images/shops/shop_example.png" alt="" fill sizes="64px" className="object-cover" /></div><div className="min-w-0"><Badge>소품샵</Badge><p className="mt-2 truncate text-16 font-semibold">{shopName}</p></div></section>

        <section className="mt-8"><label htmlFor="visited-at" className="text-14 font-semibold">방문일 <span className="text-red-600">필수</span></label><input ref={dateRef} id="visited-at" type="date" value={visitedAt} onChange={(event) => setVisitedAt(event.target.value)} aria-invalid={dateError || undefined} aria-describedby={dateError ? "visited-at-error" : undefined} className="mt-2 min-h-12 w-full rounded-xl border border-black-300 px-4 text-14 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />{dateError ? <p id="visited-at-error" className="mt-2 text-12 text-red-600">방문일을 선택해 주세요.</p> : null}</section>

        <fieldset aria-describedby={tagError ? "visit-tags-error" : undefined} className="mt-8"><legend className="text-14 font-semibold">방문 태그 <span className="text-red-600">필수</span></legend><p className="mt-1 text-12 text-black-500">기억에 남은 점을 모두 골라 주세요.</p><div className="mt-3 flex flex-wrap gap-2">{VISIT_TAGS.map((tag) => { const selected = selectedTags.includes(tag); return <button key={tag} type="button" aria-pressed={selected} onClick={() => toggleTag(tag)} className={`min-h-10 rounded-full border px-4 text-13 font-medium focus-visible:outline-2 focus-visible:outline-green-500 ${selected ? "border-green-500 bg-green-100 text-green-800" : "border-black-200 bg-white text-black-700"}`}>{tag}</button>; })}</div>{tagError ? <p id="visit-tags-error" className="mt-2 text-12 text-red-600">방문 태그를 하나 이상 선택해 주세요.</p> : null}</fieldset>

        <Textarea value={content} onChange={(event) => setContent(event.target.value)} label="한 줄 후기" placeholder="이 상점에서 기억에 남은 점을 적어 주세요." maxLength={120} showCharacterCount errorMessage={contentError ? "한 줄 후기를 입력해 주세요." : undefined} className="mt-8" />

        <section className="mt-8"><div className="flex items-end justify-between gap-3"><div><h2 className="text-14 font-semibold">사진 첨부</h2><p className="mt-1 text-12 text-black-500">사진은 최대 3장까지 미리 볼 수 있어요.</p></div><label htmlFor="visit-photos" className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-black-300 px-4 text-14 font-semibold focus-within:outline-2 focus-within:outline-green-500">사진 선택<input id="visit-photos" aria-label="사진 첨부" type="file" accept="image/*" multiple onChange={changePhotos} className="sr-only" /></label></div>{previews.length > 0 ? <ul aria-label="선택한 사진" className="mt-4 grid grid-cols-3 gap-2">{previews.map((preview, index) => <li key={preview.url} className="relative aspect-square overflow-hidden rounded-xl bg-black-100"><Image src={preview.url} alt={`${preview.name} 미리보기`} fill unoptimized className="object-cover" /><button type="button" aria-label={`${preview.name} 삭제`} onClick={() => removePhoto(index)} className="absolute right-1 top-1 grid size-8 place-items-center rounded-full bg-black-950/70 text-white focus-visible:outline-2 focus-visible:outline-white">×</button></li>)}</ul> : <div className="mt-4 grid h-28 place-items-center rounded-2xl border border-dashed border-black-300 text-12 text-black-500">선택한 사진이 없어요.</div>}</section>

        {showErrors && (dateError || tagError || contentError) ? <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-13 text-red-700">필수 항목을 확인해 주세요.</p> : null}
        {submitted ? <p role="status" className="mt-8 rounded-xl bg-green-50 px-4 py-3 text-13 text-green-800">후기가 작성되었어요.</p> : null}
        <div className="mt-8 grid grid-cols-2 gap-3"><Link href={`/shops/${shopId}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black-300 text-14 font-semibold focus-visible:outline-2 focus-visible:outline-green-500">취소</Link><Button type="submit" fullWidth>작성 완료</Button></div>
      </form>
    </main>
  );
}
