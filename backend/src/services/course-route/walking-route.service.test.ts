import { afterEach, describe, expect, it, vi } from "vitest";

import { getWalkingRoute } from "./walking-route.service.js";

describe("getWalkingRoute", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("중간 상점을 경유지로 넣어 코스 전체 도보 경로를 한 번 조회합니다", async () => {
    vi.stubEnv("TMAP_APP_KEY", "test-app-key");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [127.1, 37.1] },
              properties: { totalDistance: 1500, totalTime: 1200 },
            },
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [127.1, 37.1],
                  [127.2, 37.2],
                ],
              },
              properties: { index: 1 },
            },
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [127.2, 37.2],
                  [127.3, 37.3],
                ],
              },
              properties: { index: 2 },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const route = await getWalkingRoute({
      stops: [
        { name: "첫 상점", latitude: 37.1, longitude: 127.1 },
        { name: "둘째 상점", latitude: 37.2, longitude: 127.2 },
        { name: "셋째 상점", latitude: 37.3, longitude: 127.3 },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({
      startX: "127.1",
      startY: "37.1",
      endX: "127.3",
      endY: "37.3",
      passList: "127.2,37.2",
      reqCoordType: "WGS84GEO",
      resCoordType: "WGS84GEO",
    });
    expect(route).toEqual({
      totalDistanceMeters: 1500,
      totalDurationSeconds: 1200,
      coordinates: [
        { latitude: 37.1, longitude: 127.1 },
        { latitude: 37.2, longitude: 127.2 },
        { latitude: 37.3, longitude: 127.3 },
      ],
    });
  });

  it("허용 범위를 벗어난 TMAP 좌표 응답을 거부합니다", async () => {
    vi.stubEnv("TMAP_APP_KEY", "test-app-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [127.1, 37.1],
                    [200, 37.2],
                  ],
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(
      getWalkingRoute({
        stops: [
          { name: "첫 상점", latitude: 37.1, longitude: 127.1 },
          { name: "둘째 상점", latitude: 37.2, longitude: 127.2 },
        ],
      }),
    ).rejects.toMatchObject({ code: "INVALID_WALKING_ROUTE_RESPONSE" });
  });
});
