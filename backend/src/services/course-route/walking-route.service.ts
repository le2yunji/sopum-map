import {
  createApiError,
  type CourseRouteCoordinate,
  type CourseWalkingRouteData,
} from "@sopum-map/shared";

type WalkingRouteStop = Readonly<{
  name: string;
  latitude: number;
  longitude: number;
}>;

type GetWalkingRouteParams = Readonly<{
  stops: readonly WalkingRouteStop[];
}>;

type TmapFeature = Readonly<{
  geometry?: Readonly<{
    type?: string;
    coordinates?: unknown;
  }>;
  properties?: Readonly<{
    index?: number;
    totalDistance?: number;
    totalTime?: number;
  }>;
}>;

type TmapPedestrianRouteResponse = Readonly<{
  features?: readonly TmapFeature[];
}>;

const TMAP_PEDESTRIAN_ROUTE_URL =
  "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1";

/** 외부 경로 좌표가 WGS84 경위도 범위인지 확인합니다. */
function isValidCoordinate(
  coordinate: unknown,
): coordinate is readonly [number, number] {
  if (!Array.isArray(coordinate) || coordinate.length < 2) {
    return false;
  }

  const [longitude, latitude] = coordinate;
  return (
    typeof longitude === "number" &&
    typeof latitude === "number" &&
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
}

/** TMAP LineString들을 응답 순서대로 하나의 연속 좌표 목록으로 합칩니다. */
function getRouteCoordinates(
  features: readonly TmapFeature[],
): CourseRouteCoordinate[] {
  const coordinates: CourseRouteCoordinate[] = [];
  const lineFeatures = features
    .filter((feature) => feature.geometry?.type === "LineString")
    .sort(
      (first, second) =>
        (first.properties?.index ?? 0) - (second.properties?.index ?? 0),
    );

  for (const feature of lineFeatures) {
    const lineCoordinates = feature.geometry?.coordinates;
    if (!Array.isArray(lineCoordinates)) {
      continue;
    }

    for (const coordinate of lineCoordinates) {
      if (!isValidCoordinate(coordinate)) {
        throw createApiError({
          status: 502,
          code: "INVALID_WALKING_ROUTE_RESPONSE",
          message: "도보 경로 정보를 올바르게 받아오지 못했습니다.",
        });
      }

      const [longitude, latitude] = coordinate;
      const previous = coordinates.at(-1);
      if (
        previous?.latitude === latitude &&
        previous.longitude === longitude
      ) {
        continue;
      }

      coordinates.push({ latitude, longitude });
    }
  }

  return coordinates;
}

/** 코스 전체의 실제 보행 경로를 조회합니다. */
export async function getWalkingRoute({
  stops,
}: GetWalkingRouteParams): Promise<CourseWalkingRouteData> {
  const appKey = process.env.TMAP_APP_KEY;
  if (!appKey) {
    throw createApiError({
      status: 500,
      code: "TMAP_APP_KEY_MISSING",
      message: "도보 경로 서비스 설정이 올바르지 않습니다.",
    });
  }

  const start = stops[0];
  const end = stops.at(-1);
  if (!start || !end || stops.length < 2 || stops.length > 6) {
    throw createApiError({
      status: 400,
      code: "INVALID_COURSE_ROUTE_SHOPS",
      message: "도보 경로에는 상점이 2개 이상 6개 이하로 필요합니다.",
    });
  }

  const waypoints = stops.slice(1, -1);
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
      ...(waypoints.length > 0
        ? {
            passList: waypoints
              .map(({ longitude, latitude }) => `${longitude},${latitude}`)
              .join("_"),
          }
        : {}),
      reqCoordType: "WGS84GEO",
      resCoordType: "WGS84GEO",
      startName: encodeURIComponent(start.name),
      endName: encodeURIComponent(end.name),
      searchOption: "10",
      sort: "index",
    }),
  });

  if (!response.ok) {
    throw createApiError({
      status: 502,
      code: "WALKING_ROUTE_PROVIDER_ERROR",
      message: "도보 경로 정보를 불러오지 못했습니다.",
    });
  }

  const data = (await response.json()) as TmapPedestrianRouteResponse;
  const features = data.features ?? [];
  const summary = features.find(
    (feature) =>
      feature.geometry?.type === "Point" &&
      typeof feature.properties?.totalDistance === "number",
  );
  const coordinates = getRouteCoordinates(features);

  if (coordinates.length < 2) {
    throw createApiError({
      status: 502,
      code: "INVALID_WALKING_ROUTE_RESPONSE",
      message: "도보 경로 정보를 올바르게 받아오지 못했습니다.",
    });
  }

  return {
    totalDistanceMeters: summary?.properties?.totalDistance ?? 0,
    totalDurationSeconds: summary?.properties?.totalTime ?? 0,
    coordinates,
  };
}
