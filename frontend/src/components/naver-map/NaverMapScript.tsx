"use client";

import Script from "next/script";

type NaverMapScriptProps = Readonly<{
  retryCount: number;
  onReady: () => void;
  onError: () => void;
}>;

/** 네이버 지도 SDK의 준비와 실패 상태를 화면에 전달합니다. */
export function NaverMapScript({
  retryCount,
  onReady,
  onError,
}: NaverMapScriptProps) {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  return (
    <Script
      key={retryCount}
      src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&retry=${retryCount}`}
      strategy="afterInteractive"
      onReady={onReady}
      onError={onError}
    />
  );
}
