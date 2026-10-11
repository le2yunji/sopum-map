/**
 * TMAP Matrix API
 * 상점 간 도보 거리·시간 행렬 생성
 */

type WalkingRoutePoint = Readonly<{
  shopId: string;
  latitude: number;
  longitude: number;
}>;

export type WalkingRouteMetric = Readonly<{
  distanceMeters: number;
  durationSeconds: number;
}>;

export type WalkingRouteMatrix = readonly (readonly WalkingRouteMetric[])[];

export type WalkingDistanceMatrix = readonly (readonly number[])[];

type TmapMatrixRoute = Readonly<{
  status: string;
  originIndex: number;
  destinationIndex: number;
  distance: number;
  duration: number;
}>;

type TmapMatrixResponse = Readonly<{
  transportMode: string;
  metric: string;

  matrixRoutes: readonly TmapMatrixRoute[];
}>;

const TMAP_MATRIX_URL = "https://apis.openapi.sk.com/tmap/matrix?version=1";
/**
 * TMAP 보행 경로 매트릭스의 거리와 예상 소요 시간을 조회합니다.
 */

export async function getWalkingRouteMatrix(
  points: readonly WalkingRoutePoint[],
): Promise<WalkingRouteMatrix> {
  if (points.length === 0) {
    return [];
  }

  const appKey = process.env.TMAP_APP_KEY;

  if (!appKey) {
    throw new Error("TMAP_APP_KEY 환경변수가 필요합니다.");
  }

  const requestBody = {
    origins: points.map((point) => ({
      lon: String(point.longitude),
      lat: String(point.latitude),
    })),

    destinations: points.map((point) => ({
      lon: String(point.longitude),
      lat: String(point.latitude),
    })),

    transportMode: "pedestrian",
    metric: "ShortestDistance",
  };

  const response = await fetch(TMAP_MATRIX_URL, {
    method: "POST",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      appKey,
    },

    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const responseText = await response.text();

    console.error("[TMAP MATRIX ERROR]", {
      status: response.status,
      body: responseText,
    });

    throw new Error(
      `TMAP 보행 거리 조회에 실패했습니다. status=${response.status}, response=${responseText}`,
    );
  }

  const data = (await response.json()) as TmapMatrixResponse;

  const unreachableMetric = {
    distanceMeters: Number.POSITIVE_INFINITY,
    durationSeconds: Number.POSITIVE_INFINITY,
  };

  const matrix = Array.from({ length: points.length }, () =>
    Array<WalkingRouteMetric>(points.length).fill(unreachableMetric),
  );

  for (let index = 0; index < points.length; index += 1) {
    matrix[index][index] = {
      distanceMeters: 0,
      durationSeconds: 0,
    };
  }

  for (const route of data.matrixRoutes) {
    const { originIndex, destinationIndex, distance, duration } = route;

    if (
      originIndex < 0 ||
      originIndex >= points.length ||
      destinationIndex < 0 ||
      destinationIndex >= points.length
    ) {
      continue;
    }

    if (!Number.isFinite(distance) || !Number.isFinite(duration)) {
      continue;
    }

    matrix[originIndex][destinationIndex] = {
      distanceMeters: distance,
      durationSeconds: duration,
    };
  }

  return matrix;
}

/** 방문 순서 최적화에 필요한 거리값만 행렬에서 분리합니다. */
export async function getWalkingDistanceMatrix(
  points: readonly WalkingRoutePoint[],
): Promise<WalkingDistanceMatrix> {
  const routeMatrix = await getWalkingRouteMatrix(points);

  return routeMatrix.map((row) => row.map((metric) => metric.distanceMeters));
}
