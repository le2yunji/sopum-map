import Link from "next/link";

import {
  CommentIcon,
  HeartIcon,
  LinkIcon,
  LocationIcon,
  StoreIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/Badge/Badge";
import type { ShopDetailView } from "../_types/shop-detail.types";
import { Button } from "@/components/ui/Button";

type Props = Readonly<{
  shop: Pick<
    ShopDetailView,
    | "name"
    | "reviewCount"
    | "likeCount"
    | "distance"
    | "tags"
    | "naverMapUrl"
    | "smartStoreUrl"
  >;
}>;

export function ShopSummarySection({ shop }: Props) {
  return (
    <section className="relative -mt-5 rounded-t-[20px] bg-white px-5 pt-5 pb-6">
      <div className="flex justify-between">
        <h1 className="text-20 font-semibold">{shop.name}</h1>

        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-14 text-black-400">
            <HeartIcon filled className="w-4 text-red-400" />
            {shop.likeCount}
          </span>
          <span className="flex items-center gap-1 text-14 text-black-400">
            <CommentIcon className="w-5 text-black-400" />
            {shop.reviewCount}
          </span>
        </div>
      </div>

      <p className="mt-1 flex items-center gap-1.5 text-12 text-black-500">
        <LocationIcon className="w-4" filled />
        {shop.distance}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {shop.tags.map((tag) => (
          <Badge key={tag} variant="pink">
            # {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {shop.naverMapUrl ? (
          <Link
            href={shop.naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-between rounded-xl border border-pink-300/30 text-14 px-4"
          >
            <span className="flex items-center gap-2 text-black-600 ">
              <LocationIcon aria-hidden="true" className="w-5 " />
              길찾기
            </span>
            <LinkIcon aria-hidden="true" className="w-5 text-black-600" />
          </Link>
        ) : (
          <Button disabled className="flex items-center justify-center">
            길찾기 준비중
          </Button>
        )}

        {shop.smartStoreUrl ? (
          <Link
            href={shop.smartStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-between rounded-xl border border-pink-300/30 text-14 px-4"
          >
            <span className="flex items-center gap-2 text-black-600">
              <StoreIcon aria-hidden="true" className="w-5" />
              스마트 스토어
            </span>
            <LinkIcon aria-hidden="true" className="w-5 text-black-600" />
          </Link>
        ) : (
          <Button disabled className="flex items-center justify-center">
            스마트 스토어 없음
          </Button>
        )}
      </div>
    </section>
  );
}
