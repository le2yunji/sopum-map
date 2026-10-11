"use client";

import { useEffect, useRef, useState } from "react";

import type {
  CourseDetailShop,
  CourseWalkingRouteData,
} from "@sopum-map/shared";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import {
  type MapSdkState,
  NaverMapScript,
} from "@/components/naver-map";

import { getOrderedWalkingRouteSegments } from "./course-route-display";

type Props = Readonly<{
  shops: readonly CourseDetailShop[];
  walkingRoute?: CourseWalkingRouteData;
}>;

export function CourseMap({ shops, walkingRoute }: Props) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const polylinesRef = useRef<naver.maps.Polyline[]>([]);
  const [sdkState, setSdkState] = useState<MapSdkState>(
    clientId ? "loading" : "missing-key",
  );
  const [retryCount, setRetryCount] = useState(0);

  /** SDK 준비 후 지도 객체를 한 번만 만들어 사용자의 확대 상태를 보존합니다. */
  useEffect(() => {
    if (sdkState !== "ready" || !mapElementRef.current) {
      return;
    }

    if (typeof naver === "undefined") {
      return;
    }

    if (mapInstanceRef.current || shops.length === 0) {
      return;
    }

    const firstShop = [...shops].sort((a, b) => a.order - b.order)[0];

    mapInstanceRef.current = new naver.maps.Map(mapElementRef.current, {
      center: new naver.maps.LatLng(firstShop.latitude, firstShop.longitude),
      zoom: 14,
      maxZoom: 21,
      draggable: true,
      scrollWheel: true,
      pinchZoom: true,
    });
  }, [sdkState, shops]);

  /** 상점이나 경로가 바뀔 때 지도는 유지하고 지도 위 요소만 갱신합니다. */
  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map || sdkState !== "ready") {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    const orderedShops = [...shops].sort((a, b) => a.order - b.order);

    if (orderedShops.length === 0) {
      return;
    }

    const shopPositions = orderedShops.map(
      (shop) => new naver.maps.LatLng(shop.latitude, shop.longitude),
    );

    markersRef.current = orderedShops.map(
      (shop, index) =>
        new naver.maps.Marker({
          map,
          position: shopPositions[index],
          zIndex: 100 + shop.order,

          icon: {
            content: `
              <div
                style="
                  width: 32px;
                  height: 32px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 9999px;
                  background: #16a34a;
                  color: white;
                  font-size: 13px;
                  font-weight: 700;
                  border: 2px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.18);
                "
              >
                ${shop.order}
              </div>
            `,
            anchor: new naver.maps.Point(16, 16),
          },
        }),
    );

    const orderedSegments = getOrderedWalkingRouteSegments(
      orderedShops,
      walkingRoute?.segments ?? [],
    );

    /** 각 도보 구간을 따로 그려 누락된 구간을 임의의 직선으로 잇지 않습니다. */
    const routePositionGroups = orderedSegments
      .map((segment) =>
        segment.coordinates.map(
          (coordinate) =>
            new naver.maps.LatLng(coordinate.latitude, coordinate.longitude),
        ),
      )
      .filter((positions) => positions.length >= 2);

    polylinesRef.current = routePositionGroups.map(
      (positions) =>
        new naver.maps.Polyline({
          map,
          path: positions,
          strokeWeight: 4,
          strokeOpacity: 0.8,
          strokeLineCap: "round",
          strokeLineJoin: "round",
        }),
    );

    /**
     * 실제 경로 전체를 기준으로 bounds를 잡습니다.
     * 경로가 없으면 상점 좌표를 기준으로 합니다.
     */
    const routePositions = routePositionGroups.flat();
    const boundsPositions =
      routePositions.length > 0 ? routePositions : shopPositions;

    if (boundsPositions.length > 1) {
      const bounds = new naver.maps.LatLngBounds(
        boundsPositions[0],
        boundsPositions[0],
      );

      for (const position of boundsPositions.slice(1)) {
        bounds.extend(position);
      }

      map.fitBounds(bounds);
    }
  }, [sdkState, shops, walkingRoute]);

  /** 화면을 벗어날 때 지도와 지도 위 요소를 함께 정리합니다. */
  useEffect(
    () => () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];

      mapInstanceRef.current?.destroy();
      mapInstanceRef.current = null;
    },
    [],
  );

  /** 실패한 지도 SDK를 새 요청으로 다시 불러옵니다. */
  const retry = () => {
    setSdkState("loading");
    setRetryCount((count) => count + 1);
  };

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-xl bg-black-100">
      <NaverMapScript
        retryCount={retryCount}
        onReady={() => setSdkState("ready")}
        onError={() => setSdkState("error")}
      />

      <div
        ref={mapElementRef}
        className="size-full"
        aria-label="코스 지도"
      />

      {sdkState !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center bg-green-50 px-6 text-center">
          {sdkState === "loading" ? (
            <div
              className="size-full"
              role="status"
              aria-label="코스 지도를 불러오는 중"
            >
              <Skeleton className="size-full rounded-xl" />
            </div>
          ) : (
            <div role="alert">
              <p className="text-14 font-semibold">
                코스 지도를 표시할 수 없어요
              </p>

              <p className="mt-1 text-12 text-black-500">
                {sdkState === "missing-key"
                  ? "네이버 지도 설정이 필요해요."
                  : "지도 연결에 실패했어요."}
              </p>

              {sdkState === "error" ? (
                <Button size="small" className="mt-3" onClick={retry}>
                  다시 시도
                </Button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
