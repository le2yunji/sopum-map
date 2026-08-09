const SCRIPT_ID = "naver-maps-sdk";
let loadingPromise: Promise<void> | null = null;

declare global {
  interface Window {
    naver?: { maps?: unknown };
  }
}

/** 네이버 지도 SDK 스크립트를 한 번만 불러옵니다. */
export function loadNaverMapsScript(clientId: string): Promise<void> {
  if (!clientId.trim()) {
    return Promise.reject(new Error("NAVER_MAP_CLIENT_ID_MISSING"));
  }

  if (window.naver?.maps) {
    return Promise.resolve();
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => resolve();
    const handleError = () => {
      loadingPromise = null;
      script.remove();
      reject(new Error("NAVER_MAP_SDK_LOAD_FAILED"));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
      document.head.appendChild(script);
    }
  });

  return loadingPromise;
}

/** 실패한 SDK 로딩 상태를 초기화해 재시도할 수 있게 합니다. */
export function resetNaverMapsScriptLoader() {
  loadingPromise = null;
  document.getElementById(SCRIPT_ID)?.remove();
}
