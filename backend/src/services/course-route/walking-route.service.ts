import { createApiError, type CourseRouteCoordinate } from "@sopum-map/shared";

type WalkingRoutePoint = Readonly<{
  latitude: number;
  longitude: number;
}>;

type TmapPointGeometry = Readonly<{
  type: "Point";
  coordinates: readonly [number, number];
}>;

type TmapLineStringGeometry = Readonly<{
  type: "LineString";
  coordinates: readonly (readonly [number, number])[];
}>;

type TmapFeature = Readonly<{
  type: "Feature";

  geometry: TmapPointGeometry | TmapLineStringGeometry;

  properties?: Readonly<{
    totalDistance?: number;
    totalTime?: number;

    distance?: number;
    time?: number;

    index?: number;
  }>;
}>;

type TmapPedestrianRouteResponse = Readonly<{
  type: "FeatureCollection";
  features: readonly TmapFeature[];
}>;

type GetWalkingRouteParams = Readonly<{
  start: WalkingRoutePoint;
  end: WalkingRoutePoint;

  startName?: string;
  endName?: string;
}>;

export type WalkingRouteResult = Readonly<{
  distanceMeters: number;
  durationSeconds: number;

  coordinates: readonly CourseRouteCoordinate[];
}>;

const TMAP_PEDESTRIAN_ROUTE_URL =
  "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1";

/**
 * 두 지점 사이의 실제 보행 경로를 조회합니다.
 */
export async function getWalkingRoute({
  start,
  end,
  startName = "출발지",
  endName = "도착지",
}: GetWalkingRouteParams): Promise<WalkingRouteResult> {
  const appKey = process.env.TMAP_APP_KEY;

  if (!appKey) {
    throw createApiError({
      status: 500,
      code: "TMAP_APP_KEY_MISSING",
      message: "도보 경로 서비스 설정이 올바르지 않습니다.",
    });
  }

  const response = await fetch(TMAP_PEDESTRIAN_ROUTE_URL, {
    method: "POST",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      appKey,
    },

    body: JSON.stringify({
      startX: String(start.longitude),
      startY: String(start.latitude),

      endX: String(end.longitude),
      endY: String(end.latitude),

      reqCoordType: "WGS84GEO",
      resCoordType: "WGS84GEO",

      startName,
      endName,

      /**
       * 최단거리 기준 보행 경로
       */
      searchOption: "10",

      sort: "index",
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();

    console.error("[TMAP PEDESTRIAN ROUTE ERROR]", {
      status: response.status,
      body: responseText,
    });

    throw createApiError({
      status: 502,
      code: "WALKING_ROUTE_PROVIDER_ERROR",
      message: "도보 경로 정보를 불러오지 못했습니다.",
    });
  }

  const data = (await response.json()) as TmapPedestrianRouteResponse;

  /**
   * 첫 번째 Point Feature에 전체 경로 정보가 포함됩니다.
   */
  const summaryFeature = data.features.find(
    (feature) =>
      feature.geometry.type === "Point" &&
      typeof feature.properties?.totalDistance === "number",
  );

  const distanceMeters = summaryFeature?.properties?.totalDistance ?? 0;

  const durationSeconds = summaryFeature?.properties?.totalTime ?? 0;

  /**
   * LineString만 추출하여
   * 네이버 지도 Polyline에서 사용할 수 있는
   * 단일 좌표 배열로 합칩니다.
   */
  const coordinates: CourseRouteCoordinate[] = [];

  for (const feature of data.features) {
    if (feature.geometry.type !== "LineString") {
      continue;
    }

    for (const [longitude, latitude] of feature.geometry.coordinates) {
      const previous = coordinates.at(-1);

      /**
       * LineString 경계에서 같은 좌표가
       * 연속으로 들어오는 경우 중복 제거
       */
      if (
        previous &&
        previous.latitude === latitude &&
        previous.longitude === longitude
      ) {
        continue;
      }

      coordinates.push({
        latitude,
        longitude,
      });
    }
  }

  if (coordinates.length < 2) {
    throw createApiError({
      status: 502,
      code: "INVALID_WALKING_ROUTE_RESPONSE",
      message: "도보 경로 정보를 올바르게 받아오지 못했습니다.",
    });
  }

  return {
    distanceMeters,
    durationSeconds,
    coordinates,
  };
}
