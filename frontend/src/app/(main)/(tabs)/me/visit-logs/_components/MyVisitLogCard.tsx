import { TAG_DEFINITION_BY_KEY, type MyVisitLogListItem } from "@sopum-map/shared";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { DEFAULT_IMAGES } from "@/constants/image.constants";

type Props = Readonly<{ visitLog: MyVisitLogListItem; onDelete: (visitLog: MyVisitLogListItem) => void }>;

/** ISO 방문일을 한국어 달력 날짜로 간결하게 표시합니다. */
function formatVisitedAt(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

/** 사진 유무에 따라 정보 밀도만 달리하고 같은 로그 동작을 제공합니다. */
export function MyVisitLogCard({ visitLog, onDelete }: Props) {
  const hasPhoto = visitLog.images.length > 0;
  return (
    <article className="overflow-hidden rounded-card border border-black-100 bg-white">
      {hasPhoto ? <div className="relative aspect-[16/10] w-full bg-black-100"><Image fill src={visitLog.images[0]?.url ?? DEFAULT_IMAGES.shop} alt={`${visitLog.shop.name} 방문 사진`} className="object-cover" sizes="(max-width: 480px) calc(100vw - 40px), 440px" /></div> : null}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {!hasPhoto ? <div className="relative size-16 shrink-0 overflow-hidden rounded-card bg-black-100"><Image fill loading="eager" src={visitLog.shop.imageUrl ?? DEFAULT_IMAGES.shop} alt={`${visitLog.shop.name} 대표 이미지`} className="object-cover" sizes="64px" /></div> : null}
          <div className="min-w-0 flex-1">
            <Link href={`/shops/${visitLog.shop.id}`} className="block truncate text-16 font-semibold focus-visible:outline-2 focus-visible:outline-green-700">{visitLog.shop.name}</Link>
            <p className="mt-1 text-12 text-black-500">{formatVisitedAt(visitLog.visitedAt)}</p>
            {!hasPhoto ? <p className="mt-1 truncate text-11 text-black-400">{visitLog.shop.address}</p> : null}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="선택한 방문 태그">
          {visitLog.selectedTagKeys.map((tagKey) => <Badge key={tagKey} size="small" variant="softGreen">{TAG_DEFINITION_BY_KEY[tagKey].label}</Badge>)}
        </div>
        {visitLog.content ? <p className="mt-3 whitespace-pre-wrap text-13 leading-5 text-black-700">{visitLog.content}</p> : null}
        <div className="mt-4 flex justify-end gap-2 border-t border-black-100 pt-3">
          <Link href={`/visit-logs/${visitLog.id}/edit`} className="inline-flex min-h-11 items-center rounded-control px-3 text-12 font-semibold text-black-700 hover:bg-black-100 focus-visible:outline-2 focus-visible:outline-green-700">수정</Link>
          <Button size="small" variant="ghost" className="text-black-500" onClick={() => onDelete(visitLog)}>삭제</Button>
        </div>
      </div>
    </article>
  );
}
