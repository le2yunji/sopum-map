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

import {
  getCourseRouteKey,
  getWalkingCoursePath,
} from "./course-route-display";

type Props = Readonly<{
  shops: readonly CourseDetailShop[];
  walkingRoute?: CourseWalkingRouteData;
  isRoutePending: boolean;
  isRouteError: boolean;
}>;

export function CourseMap({
  shops,
  walkingRoute,
  isRoutePending,
  isRouteError,
}: Props) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
  const fittedRouteKeyRef = useRef<string | null>(null);
  const [sdkState, setSdkState] = useState<MapSdkState>(
    clientId ? "loading" : "missing-key",
  );
  const [retryCount, setRetryCount] = useState(0);
  const routeCoordinates = walkingRoute?.coordinates;

  /** SDK 준비 후 지도와 Polyline을 한 번만 만들어 사용자 줌 상태를 보존합니다. */
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
      maxZoom: 21,
      draggable: true,
      scrollWheel: true,
      pinchZoom: true,
      keyboardShortcuts: true,
      disableDoubleClickZoom: false,
      zoomControl: true,
      zoomControlOptions: {
        style: naver.maps.ZoomControlStyle.SMALL,
        position: naver.maps.Position.TOP_RIGHT,
      },
    });

    polylineRef.current = new naver.maps.Polyline({
      map: mapInstanceRef.current,
      path: [],
      strokeColor: "#16a34a",
      strokeWeight: 5,
      strokeOpacity: 0.9,
      strokeLineCap: "round",
      strokeLineJoin: "round",
    });
  }, [sdkState, shops]);

  /** 상점이 바뀔 때 지도는 유지하고 방문 순서 마커만 갱신합니다. */
  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map || sdkState !== "ready") {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

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

  }, [sdkState, shops]);

  /** TMAP 좌표가 바뀔 때만 기존 Polyline의 경로를 교체합니다. */
  useEffect(() => {
    const polyline = polylineRef.current;
    if (!polyline || sdkState !== "ready") {
      return;
    }

    const routePositions = getWalkingCoursePath(
      routeCoordinates ?? [],
    ).map(
      ({ latitude, longitude }) =>
        new naver.maps.LatLng(latitude, longitude),
    );
    polyline.setPath(routePositions);
  }, [sdkState, routeCoordinates]);

  /** 코스별 최초 경로가 준비됐을 때만 전체 경로에 화면을 맞춥니다. */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || sdkState !== "ready") {
      return;
    }

    const routePositions = getWalkingCoursePath(routeCoordinates ?? []).map(
      ({ latitude, longitude }) =>
        new naver.maps.LatLng(latitude, longitude),
    );

    const routeKey = getCourseRouteKey(shops);
    if (
      routePositions.length < 2 ||
      fittedRouteKeyRef.current === routeKey
    ) {
      return;
    }

    const bounds = new naver.maps.LatLngBounds(
      routePositions[0],
      routePositions[0],
    );
    for (const position of routePositions.slice(1)) {
      bounds.extend(position);
    }

    map.fitBounds(bounds);
    fittedRouteKeyRef.current = routeKey;
  }, [sdkState, shops, routeCoordinates]);

  /** 화면을 벗어날 때 지도와 지도 위 요소를 함께 정리합니다. */
  useEffect(
    () => () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      polylineRef.current?.setMap(null);
      polylineRef.current = null;
      fittedRouteKeyRef.current = null;

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

      {sdkState === "ready" && (isRoutePending || isRouteError) ? (
        <p
          className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1.5 text-12 text-black-600 shadow-sm"
          role={isRouteError ? "alert" : "status"}
        >
          {isRouteError
            ? "도보 경로를 표시하지 못했어요."
            : "도보 경로를 불러오는 중..."}
        </p>
      ) : null}

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
