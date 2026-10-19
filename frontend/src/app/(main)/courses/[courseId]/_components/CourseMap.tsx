"use client";

import { useEffect, useRef, useState } from "react";

import type { CourseDetailShop } from "@sopum-map/shared";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import {
  type MapSdkState,
  NaverMapScript,
} from "@/components/naver-map";

import { getStraightCoursePath } from "./course-route-display";

type Props = Readonly<{
  shops: readonly CourseDetailShop[];
}>;

export function CourseMap({ shops }: Props) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
  const [sdkState, setSdkState] = useState<MapSdkState>(
    clientId ? "loading" : "missing-key",
  );
  const [retryCount, setRetryCount] = useState(0);

  /** SDK 준비 후 움직이지 않는 코스 미리보기 지도를 한 번만 만듭니다. */
  useEffect(() => {
    if (sdkState !== "ready" || !mapElementRef.current) {
      return;
    }

    if (typeof naver === "undefined") {
      return;
    }

    const firstShop = [...shops]
      .sort((a, b) => a.order - b.order)
      .find(
        (shop): shop is CourseDetailShop & {
          latitude: number;
          longitude: number;
        } => shop.latitude !== null && shop.longitude !== null,
      );

    if (mapInstanceRef.current || !firstShop) {
      return;
    }

    mapInstanceRef.current = new naver.maps.Map(mapElementRef.current, {
      center: new naver.maps.LatLng(firstShop.latitude, firstShop.longitude),
      zoom: 14,
      draggable: false,
      scrollWheel: false,
      pinchZoom: false,
      keyboardShortcuts: false,
      disableDoubleClickZoom: true,
      zoomControl: false,
    });
  }, [sdkState, shops]);

  /** 상점이 바뀔 때 지도는 유지하고 마커와 직선 경로만 갱신합니다. */
  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map || sdkState !== "ready") {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    polylineRef.current?.setMap(null);
    polylineRef.current = null;

    const orderedShops = [...shops]
      .sort((a, b) => a.order - b.order)
      .filter(
        (shop): shop is CourseDetailShop & {
          latitude: number;
          longitude: number;
        } => shop.latitude !== null && shop.longitude !== null,
      );

    if (orderedShops.length === 0) {
      return;
    }

    const shopPositions = getStraightCoursePath(orderedShops).map(
      (coordinate) =>
        new naver.maps.LatLng(coordinate.latitude, coordinate.longitude),
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

    polylineRef.current =
      shopPositions.length >= 2
        ? new naver.maps.Polyline({
            map,
            path: shopPositions,
            strokeColor: "#16a34a",
            strokeWeight: 5,
            strokeOpacity: 0.9,
            strokeLineCap: "round",
            strokeLineJoin: "round",
          })
        : null;

    /** 모든 상점이 고정 미리보기 안에 보이도록 화면 범위를 맞춥니다. */
    if (shopPositions.length > 1) {
      const bounds = new naver.maps.LatLngBounds(
        shopPositions[0],
        shopPositions[0],
      );

      for (const position of shopPositions.slice(1)) {
        bounds.extend(position);
      }

      map.fitBounds(bounds);
    }
  }, [sdkState, shops]);

  /** 화면을 벗어날 때 지도와 지도 위 요소를 함께 정리합니다. */
  useEffect(
    () => () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      polylineRef.current?.setMap(null);
      polylineRef.current = null;

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
    <div className="relative h-[280px] w-full overflow-hidden rounded-card bg-black-100">
      <NaverMapScript
        retryCount={retryCount}
        onReady={() => setSdkState("ready")}
        onError={() => setSdkState("error")}
      />

      <div
        ref={mapElementRef}
        className="pointer-events-none size-full"
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
              <Skeleton className="size-full rounded-card" />
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
