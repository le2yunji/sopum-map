import type { MyVisitLogListItem } from "@sopum-map/shared";
import Image from "next/image";
import Link from "next/link";

import { DEFAULT_IMAGES } from "@/constants/image.constants";

import { formatVisitLogDate } from "./visit-log-display";

type Props = Readonly<{
  visitLog: MyVisitLogListItem;
  imageLoading?: "eager" | "lazy";
}>;

/** 사진 한 장을 방문 로그 상세로 이어지는 정사각형 피드 항목으로 표시합니다. */
export function MyVisitLogGridItem({
  visitLog,
  imageLoading = "lazy",
}: Props) {
  const visitPhoto = visitLog.images[0];
  const photoCount = visitLog.images.length;
  const thumbnailUrl = visitPhoto?.url ?? DEFAULT_IMAGES.visitLog;
  const visitedAt = formatVisitLogDate(visitLog.visitedAt);

  return (
    <Link
      href={`/me/visit-logs/${visitLog.id}`}
      aria-label={`${visitLog.shop.name}, ${visitedAt} 방문 로그 보기`}
      className="group relative aspect-square min-w-0 overflow-hidden bg-black-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
    >
      <Image
        fill
        src={thumbnailUrl}
        alt=""
        loading={imageLoading}
        sizes="(max-width: 480px) 33vw, 160px"
        className="object-cover transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:transition-none"
        onError={(event) => {
          if (!event.currentTarget.src.includes(DEFAULT_IMAGES.visitLog)) {
            event.currentTarget.src = DEFAULT_IMAGES.visitLog;
          }
        }}
      />

      {photoCount > 0 ? (
        <span
          aria-label={`방문 사진 ${photoCount}장`}
          className="absolute right-1.5 top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/85 px-1.5 text-10 font-semibold text-green-800 shadow-sm backdrop-blur-sm"
        >
          {photoCount}
        </span>
      ) : null}
    </Link>
  );
}
