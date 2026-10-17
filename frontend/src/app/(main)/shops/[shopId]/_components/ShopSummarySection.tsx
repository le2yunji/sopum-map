import Link from "next/link";

import {
  CommentIcon,
  HeartIcon,
  LocationIcon,
  TimeIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/Button";

import { ShopDetailData } from "@sopum-map/shared";
import { formatTodayBusinessHours } from "../_utils/business-hours";
import { NaverMapRouteLink } from "./NaverMapRouteLink";
import { CameraIcon } from "@/components/icons/CameraIcon";

type Props = Readonly<{
  shop: Pick<
    ShopDetailData,
    | "id"
    | "name"
    | "visitLogCount"
    | "likeCount"
    | "tags"
    | "address"
    | "businessHours"
    | "naverPlaceUrl"
    | "latitude"
    | "longitude"
  >;
  isLiked: boolean;
  isLikePending: boolean;
  onToggleLike: () => void;
}>;

export function ShopSummarySection({
  shop,
  isLiked,
  isLikePending,
  onToggleLike,
}: Props) {
  return (
    <section className="relative -mt-5 rounded-t-card bg-white px-5 pt-5 pb-6">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-20 font-semibold mb-2">{shop.name}</h1>

        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-14 text-black-800">
            <HeartIcon filled className="w-5 text-red-400" />
            {shop.likeCount}
          </span>
          <span className="flex items-center gap-1 text-14 text-black-800">
            <CommentIcon className="w-6 text-black-400" />
            {shop.visitLogCount}
          </span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1 text-black-500">
          <LocationIcon aria-hidden="true" className="size-4 shrink-0" />
          <div className="min-w-0 truncate text-12">{shop.address}</div>
        </div>
        <NaverMapRouteLink
          name={shop.name}
          latitude={shop.latitude}
          longitude={shop.longitude}
          naverPlaceUrl={shop.naverPlaceUrl}
        />
      </div>

      <div className="mt-1 flex items-center gap-1 text-black-500">
        <TimeIcon aria-hidden="true" className="size-4 shrink-0" />
        <div className="text-12">
          {formatTodayBusinessHours(shop.businessHours)}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
        {shop.tags.map((tag) => (
          <span key={tag.key} className="text-13 font-medium text-green-700">
            # {tag.label}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          fullWidth
          aria-label={isLiked ? "내 픽에서 제거" : "내 픽에 추가"}
          aria-pressed={isLiked}
          disabled={isLikePending}
          onClick={onToggleLike}
          leftIcon={<HeartIcon filled={isLiked} className="size-5" />}
        >
          내 픽에 추가하기
        </Button>
        <Link
          href={`/shops/${shop.id}/visit-logs/new`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-black-100 px-3 text-14 font-semibold text-black-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <CameraIcon aria-hidden="true" className="size-5" />
          방문 로그 작성하기
        </Link>
      </div>
    </section>
  );
}
