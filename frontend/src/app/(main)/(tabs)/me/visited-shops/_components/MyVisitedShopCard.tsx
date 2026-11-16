import type { VisitedShopListItem } from "@sopum-map/shared";
import { SHOP_REGION_GROUP_LABELS } from "@sopum-map/shared";
import Image from "next/image";
import Link from "next/link";

import { PenIcon } from "@/components/icons";
import { Badge } from "@/components/ui/Badge/Badge";

const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";

type MyVisitedShopCardProps = Readonly<{
  shop: VisitedShopListItem;
  imageLoading?: "eager" | "lazy";
}>;

/** 마지막 방문 시각을 한국 날짜로 표시합니다. */
function formatLastVisitedAt(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

/** 방문 상점의 이미지와 방문 정보를 한 행으로 표시합니다. */
export function MyVisitedShopCard({
  shop,
  imageLoading = "lazy",
}: MyVisitedShopCardProps) {
  const activityDate = shop.lastVisitLogAt ?? shop.lastVisitedAt;
  const activityLabel = shop.lastVisitLogAt
    ? "방문로그 작성"
    : "코스에서 방문 완료";

  return (
    <article>
      <Link
        href={`/shops/${shop.id}`}
        aria-label={`${shop.name} 상세 보기`}
        className="
          flex min-h-28 items-center gap-3
          rounded-control py-4
          transition-colors
          hover:bg-surface-secondary
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-brand
        "
      >
        <span
          className="
            relative size-20 shrink-0
            overflow-hidden rounded-control
            bg-surface-muted
          "
        >
          <Image
            fill
            src={shop.mainImageUrl ?? DEFAULT_SHOP_IMAGE}
            alt={`${shop.name} 매장 이미지`}
            sizes="80px"
            loading={imageLoading}
            className="object-cover"
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <strong className="min-w-0 truncate text-15 font-semibold text-fg-primary">
              {shop.name}
            </strong>

            <Badge
              variant="softGreen"
              size={null}
              className="px-1.5 py-0.5 text-10"
            >
              {SHOP_REGION_GROUP_LABELS[shop.regionGroup]}
            </Badge>
          </span>
          <span className="mt-1.5 block text-12 font-medium text-fg-secondary">
            {formatLastVisitedAt(activityDate)} {activityLabel}
          </span>

          <span className="mt-2 block text-12 text-fg-tertiary">
            마지막 방문 {formatLastVisitedAt(shop.lastVisitedAt)}
          </span>
        </span>

        {shop.lastVisitLogAt ? (
          <Badge
            aria-label={`${shop.name} 방문로그 작성됨`}
            variant="softGreen"
            size={null}
            className="size-7 p-0 text-green-700"
          >
            <PenIcon className="size-3.5" aria-hidden="true" />
          </Badge>
        ) : null}
      </Link>
    </article>
  );
}
