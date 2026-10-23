"use client";

import { TAG_DEFINITION_BY_KEY, type MyVisitLogListItem } from "@sopum-map/shared";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { EllipsisVerticalIcon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge/Badge";
import { DEFAULT_IMAGES } from "@/constants/image.constants";

type Props = Readonly<{ visitLog: MyVisitLogListItem; onDelete: (visitLog: MyVisitLogListItem) => void }>;

/** ISO 방문일을 한국어 달력 날짜로 간결하게 표시합니다. */
function formatVisitedAt(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

/** 사진 유무에 따라 정보 밀도만 달리하고 같은 로그 동작을 제공합니다. */
export function MyVisitLogCard({ visitLog, onDelete }: Props) {
  const hasPhoto = visitLog.images.length > 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = `visit-log-actions-${visitLog.id}`;

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuContainerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <article className="relative overflow-hidden rounded-card border border-black-100 bg-white">
      <div
        ref={menuContainerRef}
        className="absolute right-3 top-3 z-10 size-9"
      >
        <button
          ref={menuButtonRef}
          type="button"
          aria-label={`${visitLog.shop.name} 방문 로그 메뉴`}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-controls={isMenuOpen ? menuId : undefined}
          onClick={() => setIsMenuOpen((current) => !current)}
          className="grid size-9 place-items-center rounded-full bg-white/90 text-black-600 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <EllipsisVerticalIcon className="size-5" aria-hidden="true" />
        </button>
        {isMenuOpen ? (
          <div
            id={menuId}
            role="menu"
            aria-label="방문 로그 관리"
            className="absolute right-0 top-full mt-1 min-w-24 overflow-hidden rounded-control border border-black-100 bg-white py-1 shadow-md"
          >
            <Link
              role="menuitem"
              href={`/visit-logs/${visitLog.id}/edit`}
              onClick={() => setIsMenuOpen(false)}
              className="flex min-h-10 items-center px-4 text-13 font-medium text-black-700 hover:bg-black-50 focus-visible:outline-2 focus-visible:outline-green-700"
            >
              수정
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                onDelete(visitLog);
              }}
              className="flex min-h-10 w-full items-center px-4 text-13 font-medium text-black-600 hover:bg-black-50 focus-visible:outline-2 focus-visible:outline-green-700"
            >
              삭제
            </button>
          </div>
        ) : null}
      </div>
      {hasPhoto ? <div className="relative aspect-[16/10] w-full bg-black-100"><Image fill src={visitLog.images[0]?.url ?? DEFAULT_IMAGES.shop} alt={`${visitLog.shop.name} 방문 사진`} className="object-cover" sizes="(max-width: 480px) calc(100vw - 40px), 440px" /></div> : null}
      <div className="p-4">
        <div className={`flex items-start gap-3 ${hasPhoto ? "" : "pr-10"}`}>
          {!hasPhoto ? <div className="relative size-16 shrink-0 overflow-hidden rounded-card bg-black-100"><Image fill loading="eager" src={visitLog.shop.imageUrl ?? DEFAULT_IMAGES.shop} alt={`${visitLog.shop.name} 대표 이미지`} className="object-cover" sizes="64px" /></div> : null}
          <div className="min-w-0 flex-1">
            <Link href={`/shops/${visitLog.shop.id}`} className="block truncate text-16 font-semibold focus-visible:outline-2 focus-visible:outline-green-700">{visitLog.shop.name}</Link>
            <p className="mt-1 text-14 text-black-500">{formatVisitedAt(visitLog.visitedAt)}</p>
            {!hasPhoto ? <p className="mt-1 truncate text-12 text-black-400">{visitLog.shop.address}</p> : null}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="선택한 방문 태그">
          {visitLog.selectedTagKeys.map((tagKey) => <Badge key={tagKey} size="small" variant="softGreen">{TAG_DEFINITION_BY_KEY[tagKey].label}</Badge>)}
        </div>
        {visitLog.content ? <p className="mt-3 whitespace-pre-wrap text-13 leading-5 text-black-700">{visitLog.content}</p> : null}
      </div>
    </article>
  );
}
