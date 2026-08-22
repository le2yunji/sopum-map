"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

import type { MapSdkState, MapShop } from "../_types/map.types";
import { getMapMarkerIcon } from "../_utils/mapMarker";
import { NaverMapScript } from "./NaverMapScript";

type NaverMapCanvasProps = Readonly<{
  shops: MapShop[]; // 지도에 표시할 상점 목록
  selectedShopId?: string; // 현재 선택된 상점
  onSelectShop: (shopId: string) => void; // 마커를 클릭했을 때 부모에게 선택된 상점을 알려주는 함수
  stateOverride?: MapSdkState;
}>;

type MapMarker = Readonly<{
  marker: naver.maps.Marker;
  listener: naver.maps.MapEventListener;
}>;

const DEFAULT_CENTER = {
  latitude: 37.5445,
  longitude: 127.056,
};

const DEFAULT_ZOOM = 14;

export function NaverMapCanvas({
  shops,
  selectedShopId,
  onSelectShop,
  stateOverride,
}: NaverMapCanvasProps) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef(new Map<string, MapMarker>());
  const [sdkState, setSdkState] = useState<MapSdkState>(
    clientId ? "loading" : "missing-key",
  );
  const [retryCount, setRetryCount] = useState(0);
  const visibleState = stateOverride ?? sdkState;

  /**
   * NAVER Maps SDK가 로드된 뒤
   * 최초 한 번 지도 인스턴스를 생성합니다.
   */
  useEffect(() => {
    if (sdkState !== "ready") {
      return;
    }

    if (!mapElementRef.current) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    if (typeof naver === "undefined") {
      return;
    }

    const map = new naver.maps.Map(mapElementRef.current, {
      center: new naver.maps.LatLng(
        DEFAULT_CENTER.latitude,
        DEFAULT_CENTER.longitude,
      ),
      zoom: DEFAULT_ZOOM,
      mapDataControl: false,
      mapTypeControl: false,
      scaleControl: false,
      logoControlOptions: {
        position: naver.maps.Position.BOTTOM_RIGHT,
      },
    });

    mapRef.current = map;
  }, [sdkState]);

  /** 지도 화면을 떠날 때 SDK 객체와 이벤트를 함께 정리합니다. */
  useEffect(
    () => () => {
      markersRef.current.forEach(({ marker, listener }) => {
        naver.maps.Event.removeListener(listener);
        marker.setMap(null);
      });
      markersRef.current.clear();
      mapRef.current?.destroy();
      mapRef.current = null;
    },
    [],
  );

  /**
   * 상점 ID를 기준으로 필요한 마커만 추가하거나 제거합니다.
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map || sdkState !== "ready") {
      return;
    }

    const visibleShopIds = new Set(shops.map((shop) => shop.id));

    markersRef.current.forEach(({ marker, listener }, shopId) => {
      if (visibleShopIds.has(shopId)) {
        return;
      }

      naver.maps.Event.removeListener(listener);
      marker.setMap(null);
      markersRef.current.delete(shopId);
    });

    shops.forEach((shop) => {
      const existingMarker = markersRef.current.get(shop.id);
      const position = new naver.maps.LatLng(shop.latitude, shop.longitude);

      if (existingMarker) {
        existingMarker.marker.setPosition(position);
        existingMarker.marker.setTitle(shop.name);
        existingMarker.marker.setIcon(
          getMapMarkerIcon(shop.id === selectedShopId),
        );
        return;
      }

      const marker = new naver.maps.Marker({
        map,
        position,
        title: shop.name,
        icon: getMapMarkerIcon(shop.id === selectedShopId),
      });

      const listener = naver.maps.Event.addListener(marker, "click", () => {
        onSelectShop(shop.id);
      });

      markersRef.current.set(shop.id, { marker, listener });
    });
  }, [shops, sdkState, onSelectShop, selectedShopId]);

  /**
   * 선택된 상점이 변경되면
   * 해당 상점 위치로 지도를 이동합니다.
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedShopId) {
      return;
    }

    const selectedShop = shops.find((shop) => shop.id === selectedShopId);

    if (!selectedShop) {
      return;
    }

    const position = new naver.maps.LatLng(
      selectedShop.latitude,
      selectedShop.longitude,
    );

    map.panTo(position);
  }, [selectedShopId, shops]);

  /** 실패한 지도 SDK를 새 요청으로 다시 불러옵니다. */
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
      <div ref={mapElementRef} className="size-full" aria-label="소품샵 지도" />

      {visibleState !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center bg-green-50 px-8 text-center">
          {visibleState === "loading" ? (
            <div className="w-full" role="status" aria-label="지도를 불러오는 중">
              <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
          ) : (
            <div role="alert" className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="font-semibold">지도를 표시할 수 없어요</p>
              <p className="mt-2 text-14 text-black-500">
                {visibleState === "missing-key"
                  ? "네이버 지도 Client ID 설정이 필요해요"
                  : "지도 연결에 실패했어요. 잠시 후 다시 시도해 주세요."}
              </p>
              {visibleState === "error" ? (
                <Button className="mt-4" onClick={retry}>
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
