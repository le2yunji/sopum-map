"use client";

import { VISIT_LOG_CONTENT_MAX_LENGTH, type MyVisitLogListItem, type TagKey } from "@sopum-map/shared";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useMyVisitLog, useUpdateVisitLog } from "@/api/visit-log/visit-log.query";
import { VisitLogTagSelector } from "@/app/(main)/shops/[shopId]/visit-logs/new/_components/VisitLogTagSelector";
import { getTodayDateInputValue, toVisitLogIsoDate } from "@/app/(main)/shops/[shopId]/visit-logs/new/_components/visit-log-date";
import { Button } from "@/components/ui/Button/Button";
import { DatePickerSheet } from "@/components/ui/DatePickerSheet";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { DEFAULT_IMAGES } from "@/constants/image.constants";

type Props = Readonly<{ visitLogId: string }>;

/** 저장된 ISO 시각을 한국 달력 입력값으로 바꿉니다. */
function toKoreanDateValue(value: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

/** 서버에서 불러온 본인 로그를 수정 폼의 초기값으로 제공합니다. */
export function VisitLogEditScreen({ visitLogId }: Props) {
  const query = useMyVisitLog(visitLogId);
  if (query.isPending) return <div role="status" className="min-h-dvh px-5 pt-16 text-center text-14 text-black-500">방문 로그를 불러오는 중...</div>;
  if (query.isError || !query.data) return <StatePanel title="수정할 방문 로그를 찾지 못했어요" action="내 방문 로그로 이동" actionHref="/me/visit-logs" />;
  return <VisitLogEditForm key={query.data.updatedAt} visitLog={query.data} />;
}

/** 방문일·태그·내용을 검증하고 본인 로그 수정 요청을 보냅니다. */
function VisitLogEditForm({ visitLog }: Readonly<{ visitLog: MyVisitLogListItem }>) {
  const router = useRouter();
  const mutation = useUpdateVisitLog(visitLog.id);
  const todayValue = getTodayDateInputValue();
  const [visitedDate, setVisitedDate] = useState(() => toKoreanDateValue(visitLog.visitedAt));
  const [selectedTagKeys, setSelectedTagKeys] = useState<readonly TagKey[]>(visitLog.selectedTagKeys);
  const [content, setContent] = useState(visitLog.content ?? "");
  const [tagError, setTagError] = useState<string | undefined>();

  /** 태그 필수값을 확인한 뒤 수정 API를 호출합니다. */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedTagKeys.length === 0) {
      setTagError("태그를 1개 이상 선택해 주세요.");
      return;
    }
    setTagError(undefined);
    mutation.mutate(
      { visitedAt: toVisitLogIsoDate(visitedDate, todayValue), selectedTagKeys, content: content.trim() || null },
      { onSuccess: () => router.replace("/me/visit-logs") },
    );
  };

  return (
    <main className="min-h-dvh bg-black-100/40 px-5 pb-28 pt-10">
      <header><p className="text-12 text-green-700">나의 기록</p><h1 className="mt-1 text-24 font-semibold">방문 로그 수정</h1></header>
      <section className="mt-5 flex items-center gap-4 rounded-card bg-white p-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-card bg-black-100"><Image fill loading="eager" src={visitLog.shop.imageUrl ?? DEFAULT_IMAGES.shop} alt={`${visitLog.shop.name} 대표 이미지`} className="object-cover" sizes="80px" /></div>
        <div className="min-w-0"><h2 className="truncate text-16 font-semibold">{visitLog.shop.name}</h2><p className="mt-1 line-clamp-2 text-12 text-black-500">{visitLog.shop.address}</p></div>
      </section>
      <form onSubmit={handleSubmit} className="mt-4 space-y-6 rounded-card bg-white p-4">
        <DatePickerSheet label="방문일" value={visitedDate} maxDateValue={todayValue} onChange={setVisitedDate} disabled={mutation.isPending} />
        <VisitLogTagSelector selectedTagKeys={selectedTagKeys} onChange={(keys) => { setSelectedTagKeys(keys); if (keys.length > 0) setTagError(undefined); }} errorMessage={tagError} />
        <Textarea label="방문 내용 (선택)" value={content} onChange={(event) => setContent(event.target.value)} maxLength={VISIT_LOG_CONTENT_MAX_LENGTH} showCharacterCount textareaClassName="min-h-36" placeholder="방문했을 때 기억하고 싶은 내용을 남겨주세요." disabled={mutation.isPending} />
        {mutation.isError ? <p role="alert" className="text-13 text-red-600">수정하지 못했어요. 입력한 내용은 그대로 유지돼요.</p> : null}
        <div className="flex gap-2"><Button fullWidth variant="outline" disabled={mutation.isPending} onClick={() => router.back()}>취소</Button><Button type="submit" fullWidth isLoading={mutation.isPending}>수정 완료</Button></div>
      </form>
    </main>
  );
}
