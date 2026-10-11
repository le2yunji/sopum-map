"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type {
  CourseDetailShop,
  CourseWalkingRouteSegment,
} from "@sopum-map/shared";

import { Button } from "@/components/ui/Button";
import {
  createNaverMapWalkRouteBetweenUrl,
  createNaverMapWalkRouteUrl,
} from "@/utils/naver-map";

import { formatWalkingSegment } from "./course-route-display";

type Props = Readonly<{
  shop: CourseDetailShop;
  previousShop: CourseDetailShop | null;
  walkingSegment?: CourseWalkingRouteSegment;
}>;

export function CourseDetailShopItem({
  shop,
  previousShop,
  walkingSegment,
}: Props) {
  const router = useRouter();

  /**
   * 첫 번째 상점은 현재 위치에서,
   * 이후 상점은 직전 방문 상점에서 길찾기를 시작합니다.
   */
  const handleOpenRoute = () => {
    const routeUrl = previousShop
      ? createNaverMapWalkRouteBetweenUrl({
          start: {
            name: previousShop.name,
            latitude: previousShop.latitude,
            longitude: previousShop.longitude,
          },
          destination: {
            name: shop.name,
            latitude: shop.latitude,
            longitude: shop.longitude,
          },
        })
      : createNaverMapWalkRouteUrl({
          name: shop.name,
          latitude: shop.latitude,
          longitude: shop.longitude,
        });

    window.location.href = routeUrl;
  };

  return (
    <div>
      {previousShop && walkingSegment ? (
        <div className="mb-4 flex items-center gap-3 px-2 text-black-500">
          <span className="h-px flex-1 bg-black-100" aria-hidden="true" />

          <span className="text-12">
            {formatWalkingSegment(walkingSegment)}
          </span>

          <span className="h-px flex-1 bg-black-100" aria-hidden="true" />
        </div>
      ) : null}

      <article className="rounded-xl border border-black-100 p-4">
        <div className="flex gap-3">
          <div
            className="
              flex size-7 shrink-0
              items-center justify-center
              rounded-full bg-green-600
              text-12 font-semibold text-white
            "
          >
            {shop.order}
          </div>

          {shop.mainImageUrl ? (
            <div
              className="
                relative size-20 shrink-0
                overflow-hidden rounded-lg
                bg-black-100
              "
            >
              <Image
                src={shop.mainImageUrl}
                alt={shop.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="
                size-20 shrink-0
                rounded-lg bg-black-100
              "
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-15 font-semibold">
                  {shop.name}
                </h3>

                <p className="mt-1 line-clamp-2 text-12 text-black-500">
                  {shop.address}
                </p>
              </div>

              {shop.isUnavailable ? (
                <span
                  className="
                    shrink-0 rounded-full
                    bg-black-100 px-2 py-1
                    text-11 text-black-600
                  "
                >
                  이용 어려움
                </span>
              ) : null}
            </div>

            {shop.memo ? (
              <p
                className="
                  mt-3 whitespace-pre-line
                  rounded-lg bg-black-50
                  px-3 py-2
                  text-12 text-black-700
                "
              >
                {shop.memo}
              </p>
            ) : null}

            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={() => {
                  router.push(`/shops/${shop.id}`);
                }}
              >
                상점 보기
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="small"
                onClick={handleOpenRoute}
              >
                길찾기
              </Button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
