import { afterEach, describe, expect, it, vi } from "vitest";

import { getWalkingRouteMatrix } from "./walking-distance-matrix.service.js";

describe("getWalkingRouteMatrix", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("TMAP 응답의 거리와 도보 시간을 행렬에 함께 보존합니다", async () => {
    vi.stubEnv("TMAP_APP_KEY", "test-app-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            transportMode: "pedestrian",
            metric: "ShortestDistance",
            matrixRoutes: [
              {
                status: "OK",
                originIndex: 0,
                destinationIndex: 1,
                distance: 620,
                duration: 421,
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const matrix = await getWalkingRouteMatrix([
      { shopId: "shop-1", latitude: 37.1, longitude: 127.1 },
      { shopId: "shop-2", latitude: 37.2, longitude: 127.2 },
    ]);

    expect(matrix[0][1]).toEqual({
      distanceMeters: 620,
      durationSeconds: 421,
    });
  });
});
