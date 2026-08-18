"use client";

import { useEffect, useRef, useState } from "react";

import type { MapShop } from "../_types/map.types";
import { NaverMapScript } from "./NaverMapScript";

type NaverMapCanvasProps = Readonly<{
  shops: MapShop[]; // 지도에 표시할 상점 목록
  selectedShopId?: string; // 현재 선택된 상점
  onSelectShop: (shopId: string) => void; // 마커를 클릭했을 때 부모에게 선택된 상점을 알려주는 함수
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
}: NaverMapCanvasProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  /**
   * NAVER Maps SDK가 로드된 뒤
   * 최초 한 번 지도 인스턴스를 생성합니다.
   */
  useEffect(() => {
    if (!isScriptLoaded) {
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
  }, [isScriptLoaded]);

  /**
   * shops가 변경될 때마다
   * 기존 마커를 제거하고 현재 상점들만 표시합니다.
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !isScriptLoaded) {
      return;
    }

    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });

    markersRef.current = [];

    const markers = shops.map((shop) => {
      const marker = new naver.maps.Marker({
        map,
        position: new naver.maps.LatLng(shop.latitude, shop.longitude),
        title: shop.name,
      });

      naver.maps.Event.addListener(marker, "click", () => {
        onSelectShop(shop.id);
      });

      return marker;
    });

    markersRef.current = markers;

    console.log(shops);

    return () => {
      markers.forEach((marker) => {
        marker.setMap(null);
      });
    };
  }, [shops, isScriptLoaded, onSelectShop]);

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

  return (
    <>
      {/* Maps JS SDK 로드 */}
      <NaverMapScript
        onLoad={() => {
          setIsScriptLoaded(true);
        }}
      />
      {/* 실제 지도 표시 영역 */}
      <div ref={mapElementRef} className="size-full" aria-label="소품샵 지도" />
    </>
  );
}
