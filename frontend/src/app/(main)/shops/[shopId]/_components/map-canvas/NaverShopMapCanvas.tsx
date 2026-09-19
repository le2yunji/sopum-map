"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

import {
  type MapSdkState,
  NaverMapScript,
  getMapMarkerIcon,
} from "@/components/naver-map";

type Props = Readonly<{
  name: string;
  latitude: number;
  longitude: number;
}>;

const DETAIL_MAP_ZOOM = 17;

export function NaverShopMapCanvas({ name, latitude, longitude }: Props) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markerRef = useRef<naver.maps.Marker | null>(null);

  const [sdkState, setSdkState] = useState<MapSdkState>(
    clientId ? "loading" : "missing-key",
  );

  const [retryCount, setRetryCount] = useState(0);

  /**
   * NAVER Maps SDK 준비 후
   * 상세 상점 위치를 중심으로 지도와 마커를 생성합니다.
   */
  useEffect(() => {
    if (sdkState !== "ready") {
      return;
    }

    if (!mapElementRef.current) {
      return;
    }

    if (typeof naver === "undefined") {
      return;
    }

    const position = new naver.maps.LatLng(latitude, longitude);

    if (!mapRef.current) {
      mapRef.current = new naver.maps.Map(mapElementRef.current, {
        center: position,
        zoom: DETAIL_MAP_ZOOM,

        draggable: true,
        scrollWheel: true,
        pinchZoom: true,

        mapDataControl: false,
        mapTypeControl: false,
        scaleControl: false,

        logoControlOptions: {
          position: naver.maps.Position.BOTTOM_RIGHT,
        },
      });
    }

    if (!markerRef.current) {
      markerRef.current = new naver.maps.Marker({
        map: mapRef.current,
        position,
        title: name,
        icon: getMapMarkerIcon(true),
      });
      return;
    }

    markerRef.current.setPosition(position);
    markerRef.current.setTitle(name);

    mapRef.current.setCenter(position);
  }, [sdkState, name, latitude, longitude]);

  /**
   * 화면을 벗어날 때 지도 객체를 정리합니다.
   */
  useEffect(
    () => () => {
      markerRef.current?.setMap(null);
      markerRef.current = null;

      mapRef.current?.destroy();
      mapRef.current = null;
    },
    [],
  );

  const retry = () => {
    setSdkState("loading");
    setRetryCount((count) => count + 1);
  };

  return (
    <div className="absolute inset-0 bg-green-50">
      <NaverMapScript
        retryCount={retryCount}
        onReady={() => setSdkState("ready")}
        onError={() => setSdkState("error")}
      />

      <div
        ref={mapElementRef}
        className="size-full"
        aria-label={`${name} 위치 지도`}
      />

      {sdkState !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center bg-green-50 px-6 text-center">
          {sdkState === "loading" ? (
            <div
              className="size-full"
              role="status"
              aria-label="지도를 불러오는 중"
            >
              <Skeleton className="size-full rounded-xl" />
            </div>
          ) : (
            <div role="alert">
              <p className="text-14 font-semibold">지도를 표시할 수 없어요</p>

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
