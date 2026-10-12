type NaverMapLocation = Readonly<{
  name: string;
  latitude: number;
  longitude: number;
}>;

type CreateNaverMapWalkRouteBetweenParams = Readonly<{
  start: NaverMapLocation;
  destination: NaverMapLocation;
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
}: NaverMapLocation): string {
  const searchParams = new URLSearchParams({
    dlat: String(latitude),
    dlng: String(longitude),
    dname: name,
    appname: NAVER_MAP_APP_NAME,
  });

  return `nmap://route/public?${searchParams.toString()}`;
}

/**
 * 현재 위치에서 매장까지의
 * 네이버 지도 도보 길찾기 URL을 생성합니다.
 */
export function createNaverMapWalkRouteUrl({
  name,
  latitude,
  longitude,
}: NaverMapLocation): string {
  const searchParams = new URLSearchParams({
    dlat: String(latitude),
    dlng: String(longitude),
    dname: name,
    appname: NAVER_MAP_APP_NAME,
  });

  return `nmap://route/walk?${searchParams.toString()}`;
}

/**
 * 두 상점 사이의 네이버 지도 도보 길찾기 URL을 생성합니다.
 */
export function createNaverMapWalkRouteBetweenUrl({
  start,
  destination,
}: CreateNaverMapWalkRouteBetweenParams): string {
  const searchParams = new URLSearchParams({
    slat: String(start.latitude),
    slng: String(start.longitude),
    sname: start.name,

    dlat: String(destination.latitude),
    dlng: String(destination.longitude),
    dname: destination.name,

    appname: NAVER_MAP_APP_NAME,
  });

  return `nmap://route/walk?${searchParams.toString()}`;
}

/**
 * PC용 네이버 지도 웹 검색 URL
 */
export function createNaverMapWebUrl(name: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(name)}`;
}
