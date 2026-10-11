/**
 * TMAP Matrix API
 * 상점 간 도보 거리 행렬 생성
 */

type WalkingRoutePoint = Readonly<{
  shopId: string;
  latitude: number;
  longitude: number;
}>;

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
 * TMAP 보행 경로 매트릭스를 조회합니다.
 *
 * 반환값 matrix[from][to]는
 * from 상점에서 to 상점까지의 도보 거리(m)입니다.
 */

export async function getWalkingDistanceMatrix(
  points: readonly WalkingRoutePoint[],
): Promise<WalkingDistanceMatrix> {
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

  const matrix = Array.from({ length: points.length }, () =>
    Array<number>(points.length).fill(Number.POSITIVE_INFINITY),
  );

  for (let index = 0; index < points.length; index += 1) {
    matrix[index][index] = 0;
  }

  for (const route of data.matrixRoutes) {
    const { originIndex, destinationIndex, distance } = route;

    if (
      originIndex < 0 ||
      originIndex >= points.length ||
      destinationIndex < 0 ||
      destinationIndex >= points.length
    ) {
      continue;
    }

    if (!Number.isFinite(distance)) {
      continue;
    }

    matrix[originIndex][destinationIndex] = distance;
  }

  return matrix;
}
