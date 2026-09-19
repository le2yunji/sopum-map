type CreateNaverMapRouteUrlParams = Readonly<{
  name: string;
  latitude: number;
  longitude: number;
}>;

const NAVER_MAP_APP_NAME = "https://www.sopummap.com";

/**
 * 현재 위치에서 매장까지의
 * 네이버 지도 대중교통 길찾기 URL을 생성합니다.
 */
export function createNaverMapPublicRouteUrl({
  name,
  latitude,
  longitude,
}: CreateNaverMapRouteUrlParams): string {
  const searchParams = new URLSearchParams({
    dlat: String(latitude),
    dlng: String(longitude),
    dname: name,
    appname: NAVER_MAP_APP_NAME,
  });

  return `nmap://route/public?${searchParams.toString()}`;
}

/**
 * PC용 네이버 지도 웹 검색 URL
 */
export function createNaverMapWebUrl(name: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(name)}`;
}
