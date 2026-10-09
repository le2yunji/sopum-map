"use client";

import { useEffect, useRef } from "react";

import type { CourseDetailShop } from "@sopum-map/shared";

type Props = Readonly<{
  shops: readonly CourseDetailShop[];
}>;

export function CourseMap({ shops }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !window.naver) {
      return;
    }

    const orderedShops = [...shops].sort((a, b) => a.order - b.order);

    if (orderedShops.length === 0) {
      return;
    }

    const positions = orderedShops.map(
      (shop) => new naver.maps.LatLng(shop.latitude, shop.longitude),
    );

    const map = new naver.maps.Map(mapRef.current, {
      center: positions[0],
      zoom: 14,
    });

    const markers = orderedShops.map(
      (shop, index) =>
        new naver.maps.Marker({
          map,
          position: positions[index],
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

    const polyline = new naver.maps.Polyline({
      map,
      path: positions,
      strokeWeight: 4,
      strokeOpacity: 0.8,
      strokeLineCap: "round",
      strokeLineJoin: "round",
    });

    if (positions.length > 1) {
      const bounds = new naver.maps.LatLngBounds(positions[0], positions[0]);

      for (const position of positions.slice(1)) {
        bounds.extend(position);
      }

      map.fitBounds(bounds);
    }

    return () => {
      markers.forEach((marker) => {
        marker.setMap(null);
      });

      polyline.setMap(null);
    };
  }, [shops]);

  return (
    <div
      ref={mapRef}
      className="h-[280px] w-full overflow-hidden rounded-xl bg-black-100"
    />
  );
}
