"use client";

import Script from "next/script";

type NaverMapScriptProps = Readonly<{
  onLoad?: () => void;
}>;

export function NaverMapScript({ onLoad }: NaverMapScriptProps) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  return (
    <Script
      src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
      strategy="afterInteractive"
      onLoad={onLoad}
    />
  );
}
