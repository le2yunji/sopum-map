/**
 * 거리 행렬을 받아 Held-Karp 최적 shopId 순서 반환
 */
type OptimizeCourseRouteResult = Readonly<{
  orderedIndexes: readonly number[];
  totalDistanceMeters: number;
}>;

/**
 * 거리 행렬을 기준으로 모든 지점을 한 번씩 방문하는
 * 최단 경로를 계산합니다.
 *
 * 시작점과 종료점은 고정하지 않습니다.
 */
export function optimizeCourseRoute(
  distanceMatrix: readonly (readonly number[])[],
  startIndex?: number,
): OptimizeCourseRouteResult {
  const shopCount = distanceMatrix.length;

  if (shopCount === 0) {
    return {
      orderedIndexes: [],
      totalDistanceMeters: 0,
    };
  }

  if (shopCount === 1) {
    return {
      orderedIndexes: [0],
      totalDistanceMeters: 0,
    };
  }

  if (shopCount > 10) {
    throw new Error("코스 최적화는 최대 10개 상점까지 지원합니다.");
  }

  for (const row of distanceMatrix) {
    if (row.length !== shopCount) {
      throw new Error("거리 행렬의 크기가 올바르지 않습니다.");
    }
  }

  const stateCount = 1 << shopCount;

  const dp = Array.from(
    {
      length: stateCount,
    },
    () => Array<number>(shopCount).fill(Number.POSITIVE_INFINITY),
  );

  const previous = Array.from(
    {
      length: stateCount,
    },
    () => Array<number>(shopCount).fill(-1),
  );

  /**
   * 출발점은 고정하지 않습니다.
   */
  if (startIndex !== undefined) {
    if (startIndex < 0 || startIndex >= shopCount) {
      throw new Error("시작점 인덱스가 올바르지 않습니다.");
    }

    dp[1 << startIndex][startIndex] = 0;
  } else {
    for (let start = 0; start < shopCount; start += 1) {
      dp[1 << start][start] = 0;
    }
  }

  for (let mask = 1; mask < stateCount; mask += 1) {
    for (let current = 0; current < shopCount; current += 1) {
      if ((mask & (1 << current)) === 0) {
        continue;
      }

      const currentDistance = dp[mask][current];

      if (!Number.isFinite(currentDistance)) {
        continue;
      }

      for (let next = 0; next < shopCount; next += 1) {
        if ((mask & (1 << next)) !== 0) {
          continue;
        }

        const segmentDistance = distanceMatrix[current][next];

        if (!Number.isFinite(segmentDistance)) {
          continue;
        }

        const nextMask = mask | (1 << next);

        const nextDistance = currentDistance + segmentDistance;

        if (nextDistance < dp[nextMask][next]) {
          dp[nextMask][next] = nextDistance;

          previous[nextMask][next] = current;
        }
      }
    }
  }

  const fullMask = stateCount - 1;

  let shortestDistance = Number.POSITIVE_INFINITY;

  let lastShopIndex = -1;

  /**
   * 종료점도 고정하지 않습니다.
   */
  for (let end = 0; end < shopCount; end += 1) {
    const distance = dp[fullMask][end];

    if (distance < shortestDistance) {
      shortestDistance = distance;
      lastShopIndex = end;
    }
  }

  if (lastShopIndex === -1 || !Number.isFinite(shortestDistance)) {
    throw new Error("모든 상점을 연결하는 도보 경로를 찾을 수 없습니다.");
  }

  const orderedIndexes: number[] = [];

  let mask = fullMask;
  let current = lastShopIndex;

  while (current !== -1) {
    orderedIndexes.push(current);

    const previousIndex = previous[mask][current];

    mask &= ~(1 << current);
    current = previousIndex;
  }

  orderedIndexes.reverse();

  return {
    orderedIndexes,
    totalDistanceMeters: shortestDistance,
  };
}
