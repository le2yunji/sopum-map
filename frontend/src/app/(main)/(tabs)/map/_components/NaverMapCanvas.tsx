"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import {
  loadNaverMapsScript,
  resetNaverMapsScriptLoader,
} from "@/lib/naver-maps/loadNaverMapsScript";

import type { MapSdkState, MapShop } from "../_types/map.types";

type NaverMapCanvasProps = {
  shops: MapShop[];
  selectedShopId?: string;
  onSelectShop: (shopId: string) => void;
  stateOverride?: MapSdkState;
};

type NaverMapsApi = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => unknown;
  LatLng: new (latitude: number, longitude: number) => unknown;
  Marker: new (options: Record<string, unknown>) => { setMap: (map: null) => void };
  Event: { addListener: (target: unknown, event: string, listener: () => void) => void };
};

/** 네이버 지도 엔진과 상점 마커를 렌더링합니다. */
export function NaverMapCanvas({
  shops,
  selectedShopId,
  onSelectShop,
  stateOverride,
}: NaverMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "";
  const [state, setState] = useState<MapSdkState>(clientId ? "loading" : "missing-key");
  const [retryKey, setRetryKey] = useState(0);
  const visibleState = stateOverride ?? state;

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let cancelled = false;
    let markers: { setMap: (map: null) => void }[] = [];

    loadNaverMapsScript(clientId)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const maps = window.naver?.maps as NaverMapsApi | undefined;
        if (!maps) throw new Error("NAVER_MAP_API_UNAVAILABLE");

        const centerShop = shops.find((shop) => shop.id === selectedShopId) ?? shops[0];
        const center = centerShop
          ? new maps.LatLng(centerShop.latitude, centerShop.longitude)
          : new maps.LatLng(37.5563, 126.9236);
        const map = new maps.Map(containerRef.current, { center, zoom: 14 });

        markers = shops.map((shop) => {
          const selected = shop.id === selectedShopId;
          const marker = new maps.Marker({
            map,
            position: new maps.LatLng(shop.latitude, shop.longitude),
            title: shop.name,
            icon: {
              content: `<span aria-hidden="true" style="display:grid;place-items:center;width:${selected ? 38 : 32}px;height:${selected ? 38 : 32}px;border:2px solid #dde5a9;border-radius:999px;background:#fff;color:#5d9c3e;font-size:18px;box-shadow:0 3px 8px rgba(0,0,0,.18)">✤</span>`,
              anchor: { x: selected ? 19 : 16, y: selected ? 19 : 16 },
            },
          });
          maps.Event.addListener(marker, "click", () => onSelectShop(shop.id));
          return marker;
        });
        setState("ready");
      })
      .catch(() => !cancelled && setState("error"));

    return () => {
      cancelled = true;
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [clientId, onSelectShop, retryKey, selectedShopId, shops]);

  const retry = () => {
    resetNaverMapsScriptLoader();
    setState("loading");
    setRetryKey((value) => value + 1);
  };

  return (
    <div className="absolute inset-0 bg-green-50">
      <div ref={containerRef} aria-label="네이버 지도" className="size-full" />
      {visibleState !== "ready" && (
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
              {visibleState === "error" && <Button className="mt-4" onClick={retry}>다시 시도</Button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
