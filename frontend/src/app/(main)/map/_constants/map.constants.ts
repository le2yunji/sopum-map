import type { MapViewport } from "../_types/map.types";

type MapRegionDefinition = Readonly<{
  value: string;
  label: string;
  regions: readonly string[];
  viewport: MapViewport;
}>;

/** 지도에 처음 진입하거나 전체 지역을 선택했을 때의 화면입니다. */
export const DEFAULT_MAP_VIEWPORT = {
  center: {
    latitude: 37.5445,
    longitude: 127.056,
  },
  zoom: 14,
} as const satisfies MapViewport;

/** 현재 위치로 이동할 때 주변 상점을 함께 볼 수 있는 확대 수준입니다. */
export const CURRENT_LOCATION_ZOOM = 16;

/**
 * 지원 지역의 검색 이름과 지도 이동 위치를 함께 관리합니다.
 *
 * 좌표와 확대 수준은 실제 모바일 화면을 보면서 조정할 수 있는
 * 초기 정책값입니다.
 */
export const MAP_REGIONS = [
  {
    value: "all",
    label: "전체",
    regions: [],
    viewport: DEFAULT_MAP_VIEWPORT,
  },
  {
    value: "seongsu-seoulforest",
    label: "성수·서울숲",
    regions: ["성수", "서울숲"],
    viewport: {
      center: {
        latitude: 37.5447,
        longitude: 127.0447,
      },
      zoom: 15,
    },
  },
  {
    value: "hongdae-yeonnam",
    label: "홍대·연남",
    regions: ["홍대", "연남"],
    viewport: {
      center: {
        latitude: 37.5637,
        longitude: 126.9236,
      },
      zoom: 15,
    },
  },
  {
    value: "mangwon",
    label: "망원",
    regions: ["망원"],
    viewport: {
      center: {
        latitude: 37.556,
        longitude: 126.9015,
      },
      zoom: 15,
    },
  },
  {
    value: "seochon",
    label: "서촌",
    regions: ["서촌"],
    viewport: {
      center: {
        latitude: 37.579,
        longitude: 126.9715,
      },
      zoom: 15,
    },
  },
] as const satisfies readonly MapRegionDefinition[];

export type MapRegion = (typeof MAP_REGIONS)[number]["value"];
