"use client";

import {
  TAG_DEFINITION_BY_KEY,
  type MyVisitLogListItem,
} from "@sopum-map/shared";
import Image from "next/image";
import Link from "next/link";
import { useState, type UIEvent } from "react";

import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { DEFAULT_IMAGES } from "@/constants/image.constants";

import { formatVisitLogDate } from "./visit-log-display";

type Props = Readonly<{
  visitLog: MyVisitLogListItem;
  onDelete: () => void;
  isDeleting?: boolean;
}>;

/** 방문 사진과 기록 내용을 모달과 단독 페이지에서 함께 쓰는 상세 본문으로 표시합니다. */
export function VisitLogDetailContent({
  visitLog,
  onDelete,
  isDeleting = false,
}: Props) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const hasVisitPhotos = visitLog.images.length > 0;
  const photos = hasVisitPhotos
    ? visitLog.images
    : [
        {
          key: "visit-log-fallback",
          url: DEFAULT_IMAGES.visitLog,
        },
      ];

  /** 가로 스크롤이 멈춘 사진을 현재 사진으로 표시합니다. */
  const handlePhotoScroll = (event: UIEvent<HTMLDivElement>) => {
    const containerWidth = event.currentTarget.clientWidth;

    if (containerWidth === 0) {
      return;
    }

    const nextPhotoIndex = Math.round(
      event.currentTarget.scrollLeft / containerWidth,
    );

    setActivePhotoIndex(Math.min(nextPhotoIndex, photos.length - 1));
  };

  return (
    <article className="bg-white pb-8">
      <div className="relative">
        <div
          aria-label={hasVisitPhotos ? "방문 사진" : "방문 사진 없음"}
          onScroll={handlePhotoScroll}
          tabIndex={hasVisitPhotos && photos.length > 1 ? 0 : undefined}
          className="flex snap-x snap-mandatory overflow-x-auto bg-black-100 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green-700 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((photo, index) => (
            <figure
              key={photo.key}
              className="relative aspect-square w-full shrink-0 snap-center"
            >
              <Image
                fill
                src={photo.url}
                alt={
                  hasVisitPhotos
                    ? `${visitLog.shop.name} 방문 사진 ${index + 1}`
                    : "방문 사진 없음"
                }
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 480px) 100vw, 480px"
                className="object-cover"
                onError={(event) => {
                  if (
                    !event.currentTarget.src.includes(DEFAULT_IMAGES.visitLog)
                  ) {
                    event.currentTarget.src = DEFAULT_IMAGES.visitLog;
                  }
                }}
              />
            </figure>
          ))}
        </div>

        {hasVisitPhotos && photos.length > 1 ? (
          <div
            role="status"
            aria-label={`현재 사진 ${activePhotoIndex + 1} / ${photos.length}`}
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/45 px-2 py-1.5 backdrop-blur-sm"
          >
            {photos.map((photo, index) => (
              <span
                key={photo.key}
                aria-hidden="true"
                className={`size-1.5 rounded-full ${
                  activePhotoIndex === index ? "bg-white" : "bg-white/45"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="px-5 pt-5">
        <p className="text-12 font-medium text-green-800">
          {formatVisitLogDate(visitLog.visitedAt)}
        </p>

        <h2 className="mt-1 text-22 font-semibold text-black-950">
          <Link
            href={`/shops/${visitLog.shop.id}`}
            className="rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            {visitLog.shop.name}
          </Link>
        </h2>

        <p className="mt-1 text-13 text-black-800">{visitLog.shop.address}</p>

        {visitLog.selectedTagKeys.length > 0 ? (
          <div
            className="mt-4 flex flex-wrap gap-1.5"
            aria-label="선택한 방문 태그"
          >
            {visitLog.selectedTagKeys.map((tagKey) => (
              <Badge
                key={tagKey}
                size="small"
                variant={null}
                className="bg-green-50 text-green-800"
              >
                {TAG_DEFINITION_BY_KEY[tagKey].label}
              </Badge>
            ))}
          </div>
        ) : null}

        {visitLog.content ? (
          <p className="mt-5 whitespace-pre-wrap text-14 leading-6 text-black-700">
            {visitLog.content}
          </p>
        ) : (
          <p className="mt-5 text-13 text-black-600">남긴 메모가 없습니다.</p>
        )}

        <div className="mt-7 space-y-2 border-t border-black-100 pt-5">
          <Link
            href={`/visit-logs/${visitLog.id}/edit`}
            aria-label="방문 로그 수정"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-control border border-pink-300/30 bg-white px-4 text-14 font-semibold text-black-800 transition-colors hover:bg-pink-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
          >
            수정
          </Link>

          <Button
            variant="ghost"
            aria-label="방문 로그 삭제"
            isLoading={isDeleting}
            onClick={onDelete}
            fullWidth
            size="small"
            className="text-12 font-medium text-black-700"
          >
            삭제
          </Button>
        </div>
      </div>
    </article>
  );
}
