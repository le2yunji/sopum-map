import Link from "next/link";

import {
  CommentIcon,
  HeartIcon,
  LinkIcon,
  StoreIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button";

import { ShopDetailData } from "@sopum-map/shared";
import { NaverMapRouteLink } from "./NaverMapRouteLink";

type Props = Readonly<{
  shop: Pick<
    ShopDetailData,
    | "name"
    | "visitLogCount"
    | "likeCount"
    | "tags"
    | "naverPlaceUrl"
    | "latitude"
    | "longitude"
  >;
}>;

export function ShopSummarySection({ shop }: Props) {
  return (
    <section className="relative -mt-5 rounded-t-[20px] bg-white px-5 pt-5 pb-6">
      <div className="flex justify-between">
        <h1 className="text-20 font-semibold">{shop.name}</h1>

        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-14 text-black-800">
            <HeartIcon filled className="w-4 text-red-400" />
            {shop.likeCount}
          </span>
          <span className="flex items-center gap-1 text-14 text-black-800">
            <CommentIcon className="w-5 text-black-400" />
            {shop.visitLogCount}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {shop.tags.map((tag) => (
          <Badge key={tag.key} variant="softGreen" shape="pill" size="medium">
            #{tag.shortLabel}
          </Badge>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <NaverMapRouteLink
          name={shop.name}
          latitude={shop.latitude}
          longitude={shop.longitude}
          naverPlaceUrl={shop.naverPlaceUrl}
        />
        {shop.naverPlaceUrl ? (
          <Link
            href={shop.naverPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-between rounded-xl border border-pink-300/30 text-14 px-4"
          >
            <span className="flex items-center gap-2 text-black-600">
              <StoreIcon aria-hidden="true" className="w-5" />
              플레이스 링크
            </span>
            <LinkIcon aria-hidden="true" className="w-5 text-black-600" />
          </Link>
        ) : (
          <Button disabled className="flex items-center justify-center">
            플레이스 준비중
          </Button>
        )}
      </div>
    </section>
  );
}
