# Map Viewport Shop Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 지도 마커를 목록 무한 스크롤에서 분리하고, 사용자가 `이 지역에서 재검색`을 선택할 때 현재 지도 영역의 마커와 목록을 함께 갱신한다.

**Architecture:** `GET /api/shops/map`은 현재 지도 경계의 가벼운 마커 데이터를 반환하고, 기존 `GET /api/shops`는 같은 경계를 적용한 페이지 목록을 반환한다. 프론트엔드는 현재 영역과 화면에 확정된 영역을 나누고, 재검색 시 두 쿼리를 먼저 캐시에 채운 뒤 둘 다 성공했을 때만 새 영역을 화면에 반영한다.

**Tech Stack:** TypeScript 6, Express 5, Zod 4, Mongoose 9, Next.js 16, React 19, TanStack Query 5, Vitest 4, Storybook 10, NAVER Maps SDK

**Spec:** `docs/superpowers/specs/2026-11-09-map-viewport-shop-search-design.md`

## Global Constraints

- 제품 코드는 사용자가 직접 수정하고, 이 계획은 파일·인터페이스·검증 순서를 안내한다.
- 지도 이동 자체는 API 요청을 만들지 않고 `이 지역에서 재검색` 선택만 새 영역 요청을 만든다.
- 마커와 목록은 같은 경계와 필터를 사용하지만 반환 타입과 페이지네이션 책임은 분리한다.
- 재검색 중에는 이전 결과를 유지하고, 두 요청이 모두 성공한 뒤 새 영역을 표시한다.
- 마커는 최대 200개이며 초과 여부를 `isTruncated`로 알린다.
- 새 라이브러리는 추가하지 않는다.

## Review Focus

- 경계 좌표 네 개 중 일부만 전달되면 두 API 모두 400으로 거부하는지 확인한다.
- 남서 좌표가 북동 좌표보다 크거나 같으면 잘못된 영역으로 거부하는지 확인한다.
- 재검색 중 한 요청만 실패해도 마커와 목록이 서로 다른 영역으로 갈라지지 않는지 확인한다.
- 선택 상점의 `panTo` 뒤에는 재검색 버튼이 나타나지 않는지 확인한다.
- 마커가 201개 이상일 때 최신 200개와 `isTruncated: true`가 안정적으로 반환되는지 확인한다.

---

### Task 1: 공용 지도 경계와 마커 계약

**Files:**
- Modify: `packages/shared/src/shop/shop.api.types.ts`
- Verify: `packages/shared/src/shop/index.ts`
- Verify: `packages/shared/src/index.ts`

**Interfaces:**
- Produces: `ShopMapBounds`, `GetShopMapQuery`, `ShopMapMarker`, `ShopMapData`, `GetShopMapResponse`
- Changes: `GetShopsQuery`에 선택 경계 좌표 네 개 추가

- [ ] **Step 1: `ShopMapBounds`와 마커 계약을 작성한다**

`ShopMapBounds`는 `southWestLat`, `southWestLng`, `northEastLat`, `northEastLng` 네 `number`를 가진다. `GetShopMapQuery`는 이 경계와 `keyword`, `tagKeys`를 조합한다. `ShopMapMarker`는 `id`, `name`, `latitude`, `longitude`, `isLiked`만 가진다. `ShopMapData`는 `items`와 `isTruncated`를 가진다.

- [ ] **Step 2: 기존 목록 쿼리에 선택 경계를 추가한다**

`GetShopsQuery`가 경계 네 값을 선택적으로 받을 수 있게 하되 기존 `lat`, `lng`, `radius` 계약은 유지한다. 런타임의 모두-or-없음 규칙은 Task 2의 Zod 검증이 책임진다.

- [ ] **Step 3: 공개 export를 확인한다**

`shop.api.types.ts`가 기존 `shop/index.ts`와 최상위 `index.ts`를 통해 이미 공개된다면 추가 파일을 수정하지 않는다.

- [ ] **Step 4: 공용 패키지 빌드를 실행한다**

Run: `pnpm --dir packages build`

Expected: TypeScript 오류 없이 종료 코드 0

- [ ] **Step 5: 체크포인트 커밋**

```bash
git add packages/shared/src/shop
git commit -m "feat: 지도 영역 상점 조회 계약 추가"
```

### Task 2: 지도 경계 검증과 목록 영역 필터

**Files:**
- Modify: `backend/src/validations/shop.validation.ts`
- Modify: `backend/src/validations/shop.validation.test.ts`
- Modify: `backend/src/services/shop/shop-query.builder.ts`
- Modify: `backend/src/services/shop/shop-query.builder.test.ts`

**Interfaces:**
- Consumes: `ShopMapBounds`, 확장된 `GetShopsQuery`
- Produces: `getShopMapQuerySchema`, `buildShopBoundsFilter(bounds: ShopMapBounds)`
- Changes: `buildShopListPipeline`가 선택 경계를 목록 `$match`에 적용

- [ ] **Step 1: 경계 검증 실패 테스트를 먼저 추가한다**

`getShopsQuerySchema`에 경계 네 개 중 일부만 전달한 경우, 위도·경도 범위를 벗어난 경우, 남서 값이 북동 값보다 크거나 같은 경우를 추가한다. `lat/lng/radius`와 경계를 동시에 전달한 경우도 거부한다.

- [ ] **Step 2: 마커 쿼리 검증 테스트를 추가한다**

`getShopMapQuerySchema`가 네 경계를 필수로 받고 문자열 숫자를 숫자로 변환하며, `keyword`와 반복 `tagKeys`를 허용하는지 확인한다.

- [ ] **Step 3: 검증 테스트가 실패하는지 확인한다**

Run: `pnpm --dir backend exec vitest run src/validations/shop.validation.test.ts`

Expected: 새 스키마 또는 경계 검증이 없어 FAIL

- [ ] **Step 4: 공통 경계 shape와 두 스키마를 구현한다**

기존 `optionalNumber`와 `tagKeysSchema`를 재사용한다. 목록 쿼리는 네 값이 모두 없거나 모두 있어야 하고, 마커 쿼리는 네 값이 모두 필수다.

- [ ] **Step 5: GeoJSON 영역 필터 테스트를 추가한다**

`buildShopBoundsFilter(bounds)`가 닫힌 Polygon 좌표를 `[lng, lat]` 순서로 생성하는지 확인한다. `buildShopListPipeline`은 경계가 있으면 첫 `$match`에 활성 상태·기존 필터·`location.$geoWithin.$geometry`를 함께 포함해야 한다.

- [ ] **Step 6: 영역 필터와 목록 파이프라인을 구현한다**

`buildShopBoundsFilter(bounds: ShopMapBounds): Record<string, unknown>`를 만들고, 반경 조회가 아닐 때만 목록 `$match`에 합친다. API 검증과 별개로 빌더에서도 반경 좌표와 경계를 함께 사용하지 않는다.

- [ ] **Step 7: 관련 테스트를 실행한다**

Run: `pnpm --dir backend exec vitest run src/validations/shop.validation.test.ts src/services/shop/shop-query.builder.test.ts`

Expected: PASS

- [ ] **Step 8: 체크포인트 커밋**

```bash
git add backend/src/validations/shop.validation.ts backend/src/validations/shop.validation.test.ts backend/src/services/shop/shop-query.builder.ts backend/src/services/shop/shop-query.builder.test.ts
git commit -m "feat: 상점 목록에 지도 영역 필터 적용"
```

### Task 3: 지도 마커 전용 백엔드 API

**Files:**
- Modify: `backend/src/services/shop/shop.service.types.ts`
- Modify: `backend/src/services/shop/shop.service.ts`
- Modify: `backend/src/services/shop/shop.service.test.ts`
- Modify: `backend/src/controllers/shop.controller.ts`
- Create: `backend/src/controllers/shop.controller.test.ts`
- Modify: `backend/src/routes/shop.routes.ts`
- Modify: `backend/src/app.test.ts`
- Create: `backend/src/services/shop/shop.constants.ts`

**Interfaces:**
- Consumes: `GetShopMapQuery`, `ShopMapData`, `getShopMapQuerySchema`, `buildShopMatchFilter`, `buildShopBoundsFilter`
- Produces: `getShopMap(params: GetShopMapServiceParams): Promise<ShopMapData>`, `getShopMapController`
- Route: `GET /api/shops/map`, declared before `GET /api/shops/:shopId`

- [ ] **Step 1: 서비스 실패 테스트를 작성한다**

영역·검색어·태그 조건이 상점 조회에 전달되는지, `limit(201)`과 `createdAt: -1, _id: -1` 정렬을 사용하는지, 로그인 사용자 좋아요 ID를 한 번에 조회하는지 테스트한다. 201개 결과는 최신 200개와 `isTruncated: true`를 반환해야 한다.

- [ ] **Step 2: 서비스 테스트가 실패하는지 확인한다**

Run: `pnpm --dir backend exec vitest run src/services/shop/shop.service.test.ts`

Expected: `getShopMap`이 없어 FAIL

- [ ] **Step 3: 서비스 타입과 상수, 서비스를 구현한다**

`SHOP_MAP_MARKER_LIMIT = 200`을 선언한다. 조회 필드는 `_id`, `name`, `location`, `createdAt`만 사용하고 좋아요 집계 외의 `likeCount`, `visitLogCount` 집계는 실행하지 않는다.

- [ ] **Step 4: 컨트롤러와 라우트 테스트를 작성한다**

유효한 경계를 서비스로 전달하고 공통 성공 응답을 반환하는지 확인한다. 경계 누락은 서비스 호출 전 400이어야 한다. `/map`이 `/:shopId` 상세 라우트로 처리되지 않는지도 확인한다.

- [ ] **Step 5: 컨트롤러와 라우트를 구현한다**

`getShopMapController`는 `getShopMapQuerySchema.parse(req.query)` 결과와 `req.auth?.userId`를 서비스로 전달한다. `shopRouter.get("/map", optionalAuth, getShopMapController)`를 `/:shopId`보다 먼저 둔다.

- [ ] **Step 6: 백엔드 관련 테스트와 빌드를 실행한다**

Run: `pnpm --dir backend exec vitest run src/services/shop/shop.service.test.ts src/controllers/shop.controller.test.ts src/app.test.ts`

Run: `pnpm --dir backend build`

Expected: 모두 PASS, 빌드 종료 코드 0

- [ ] **Step 7: 체크포인트 커밋**

```bash
git add backend/src/services/shop backend/src/controllers/shop.controller.ts backend/src/controllers/shop.controller.test.ts backend/src/routes/shop.routes.ts backend/src/app.test.ts
git commit -m "feat: 지도 영역 마커 조회 API 추가"
```

### Task 4: 프론트엔드 상점 쿼리 분리

**Files:**
- Modify: `frontend/src/api/shops/shop.api.ts`
- Create: `frontend/src/api/shops/shop.api.test.ts`
- Modify: `frontend/src/api/shops/shop.query.ts`
- Create: `frontend/src/api/shops/shop.query.test.ts`

**Interfaces:**
- Consumes: `GetShopMapQuery`, `ShopMapData`, 확장된 `GetShopsQuery`
- Produces: `getShopMap(query: GetShopMapQuery): Promise<ShopMapData>`, `shopQueryKeys.map(query)`, `createShopMapQueryOptions(query, enabled)`, `useShopMap(query, enabled)`
- Changes: `createShopsSearchParams`가 경계 네 값을 직렬화

- [ ] **Step 1: URL 직렬화 테스트를 작성한다**

목록과 마커 요청이 네 경계, 검색어, 반복 태그 키를 정확한 query string으로 만드는지 확인한다.

- [ ] **Step 2: API 테스트가 실패하는지 확인한다**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/api/shops/shop.api.test.ts`

Expected: 마커 API 함수와 경계 직렬화가 없어 FAIL

- [ ] **Step 3: 마커 API 함수와 목록 경계 직렬화를 구현한다**

공통 경계 직렬화 도우미를 같은 파일 안에 두고 두 요청이 사용한다. `getShopMap`은 `/shops/map`을 호출한다.

- [ ] **Step 4: 쿼리 옵션 테스트를 작성한다**

목록 키와 마커 키가 서로 다르고, 경계 또는 필터가 바뀌면 키도 바뀌는지 확인한다. 마커 쿼리는 이전 데이터를 placeholder로 유지해야 한다.

- [ ] **Step 5: 재사용 가능한 쿼리 옵션과 훅을 구현한다**

기존 `useInfiniteShops` 내부 옵션을 `createInfiniteShopsQueryOptions`로 추출한다. 새 `createShopMapQueryOptions`는 `queryKey`, `queryFn`, `enabled`, `placeholderData: keepPreviousData`를 제공하고 `useShopMap`이 이를 사용한다.

- [ ] **Step 6: 프론트엔드 API 테스트를 실행한다**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/api/shops/shop.api.test.ts src/api/shops/shop.query.test.ts`

Expected: PASS

- [ ] **Step 7: 체크포인트 커밋**

```bash
git add frontend/src/api/shops
git commit -m "feat: 지도 마커 조회 쿼리 분리"
```

### Task 5: 지도 경계 상태와 NAVER 지도 이벤트

**Files:**
- Create: `frontend/src/app/(main)/map/_hooks/useMapViewportSearch.ts`
- Create: `frontend/src/app/(main)/map/_hooks/useMapViewportSearch.test.ts`
- Create: `frontend/src/app/(main)/map/_utils/mapBounds.ts`
- Create: `frontend/src/app/(main)/map/_utils/mapBounds.test.ts`
- Modify: `frontend/src/app/(main)/map/_components/map-canvas/NaverMapCanvas.tsx`
- Modify: `frontend/src/components/naver-map/naverMap.types.ts`

**Interfaces:**
- Produces: `MapBounds`, `normalizeMapBounds(bounds)`, `areMapBoundsEqual(left, right)`, `useMapViewportSearch()`
- Changes: `NaverMapCanvas`에 `onBoundsChange(bounds: MapBounds)` 추가
- Preserves: `onSelectShop`, `selectedShopId`, 기존 마커 관리

- [ ] **Step 1: 경계 정규화와 비교 테스트를 작성한다**

같은 영역의 작은 부동소수점 차이는 같다고 판단하고, 의미 있는 이동과 확대·축소는 다르다고 판단하는 사례를 고정한다.

- [ ] **Step 2: 상태 훅 테스트를 작성한다**

최초 경계 등록, 사용자 이동 뒤 재검색 필요 상태, 요청 시작, 두 조회 성공 뒤 확정, 실패 뒤 기존 확정 영역 유지 흐름을 테스트한다.

- [ ] **Step 3: 유틸과 훅 테스트가 실패하는지 확인한다**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts 'src/app/(main)/map/_utils/mapBounds.test.ts' 'src/app/(main)/map/_hooks/useMapViewportSearch.test.ts'`

Expected: 새 모듈이 없어 FAIL

- [ ] **Step 4: 경계 유틸과 상태 훅을 구현한다**

훅은 `draftBounds`, `requestedBounds`, `searchedBounds`, `needsSearch`, `initializeBounds`, `updateDraftBounds`, `startSearch`, `commitSearch`, `failSearch`을 반환한다. 상태 전이는 네트워크 호출을 직접 실행하지 않는다.

- [ ] **Step 5: NAVER 지도에서 초기 경계와 `idle` 경계를 전달한다**

지도 생성 직후 현재 `getBounds()`를 전달하고 `idle` 이벤트를 등록한다. 언마운트 때 이벤트를 제거한다. 선택 상점 `panTo` 직전에 ref를 설정해 다음 `idle` 한 번은 경계 변경 알림을 생략한다.

- [ ] **Step 6: 관련 단위 테스트와 타입 검사를 실행한다**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts 'src/app/(main)/map/_utils/mapBounds.test.ts' 'src/app/(main)/map/_hooks/useMapViewportSearch.test.ts'`

Run: `pnpm --dir frontend lint`

Expected: PASS, lint 오류 없음

- [ ] **Step 7: 체크포인트 커밋**

```bash
git add 'frontend/src/app/(main)/map/_hooks' 'frontend/src/app/(main)/map/_utils' 'frontend/src/app/(main)/map/_components/map-canvas/NaverMapCanvas.tsx' frontend/src/components/naver-map/naverMap.types.ts
git commit -m "feat: 지도 영역 재검색 상태 추가"
```

### Task 6: 지도 화면 재검색 흐름과 UI 통합

**Files:**
- Create: `frontend/src/app/(main)/map/_components/MapAreaSearchButton.tsx`
- Modify: `frontend/src/app/(main)/map/_components/MapScreen.tsx`
- Modify: `frontend/src/app/(main)/map/_mappers/mapShop.mapper.ts`
- Create or Modify: `frontend/src/app/(main)/map/_components/MapScreen.stories.tsx`

**Interfaces:**
- Consumes: `useMapViewportSearch`, `createInfiniteShopsQueryOptions`, `createShopMapQueryOptions`, `ShopMapMarker`
- Produces: 사용자가 명시적으로 확정하는 지도 영역 검색 화면

- [ ] **Step 1: Storybook 상호작용 시나리오를 먼저 작성한다**

`mapSlot`으로 초기 경계를 전달한 뒤 최초 조회가 발생하는지, 지도 이동 경계를 전달해도 요청이 늘지 않는지, 버튼 선택 후 두 요청이 발생하는지 확인한다. 목록 다음 페이지 요청 뒤 마커 개수가 변하지 않는지도 확인한다.

- [ ] **Step 2: 실패와 로딩 시나리오를 추가한다**

재검색 중 기존 마커·목록과 `검색 중...` 버튼이 남는지, 한 요청 실패 시 기존 결과와 다시 검색 가능한 버튼이 남는지, `isTruncated` 안내가 표시되는지 확인한다.

- [ ] **Step 3: Storybook 테스트가 실패하는지 확인한다**

Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/map/_components/MapScreen.stories.tsx'`

Expected: 재검색 버튼과 분리 쿼리가 없어 FAIL

- [ ] **Step 4: 재검색 버튼을 구현한다**

버튼은 `needsSearch`일 때만 표시하고 요청 중에는 `검색 중...` 문구와 `disabled`를 사용한다. 지도 상단 검색 UI와 접힌 바텀시트 사이에 기존 토큰으로 배치한다.

- [ ] **Step 5: 두 쿼리를 캐시에 먼저 채운 뒤 영역을 확정한다**

`MapScreen`에서 `queryClient.fetchQuery(createShopMapQueryOptions(...))`와 `queryClient.fetchInfiniteQuery(createInfiniteShopsQueryOptions(...))`를 `Promise.all`로 실행한다. 둘 다 성공하면 `commitSearch`하고, 실패하면 `failSearch`한다. 확정 뒤 화면 훅은 이미 캐시에 있는 새 영역 결과를 사용한다.

- [ ] **Step 6: 목록과 마커 표시 모델을 분리한다**

목록은 `useInfiniteShops` 페이지를 `MapShop`으로 변환하고, 마커는 `useShopMap` 결과를 마커 전용 타입으로 전달한다. `pickedOnly`는 각 응답의 `isLiked`를 이용한 기존 로컬 필터 정책을 유지한다.

- [ ] **Step 7: 필터와 프로그램 이동을 연결한다**

검색어·태그가 변경되면 현재 `draftBounds`로 같은 사전 조회 흐름을 실행한다. `panTo`로 생긴 `idle`은 Task 5의 억제 로직으로 재검색 상태를 만들지 않는다.

- [ ] **Step 8: Storybook과 단위 검증을 실행한다**

Run: `pnpm --dir frontend test:unit`

Run: `pnpm --dir frontend exec vitest --project storybook --run`

Run: `pnpm --dir frontend lint`

Expected: 모두 PASS

- [ ] **Step 9: 모바일 화면과 접근성을 확인한다**

320px, 390px, 480px에서 검색 헤더·버튼·위치 컨트롤·접힌 시트가 겹치지 않는지 확인한다. Tab으로 버튼에 접근하고 로딩·오류 안내가 읽히는지 확인한다.

- [ ] **Step 10: 체크포인트 커밋**

```bash
git add 'frontend/src/app/(main)/map'
git commit -m "feat: 지도 이 지역 재검색 흐름 구현"
```

### Task 7: 전체 회귀 검증과 이슈 갱신

**Files:**
- Verify: all changed files
- Update after completion: GitHub issue `#129`

**Interfaces:**
- Consumes: Tasks 1-6의 완성된 계약과 화면
- Produces: 병합 가능한 검증 결과

- [ ] **Step 1: 전체 검증을 실행한다**

Run: `pnpm --dir packages build`

Run: `pnpm --dir backend test`

Run: `pnpm --dir backend build`

Run: `pnpm --dir frontend test:unit`

Run: `pnpm --dir frontend exec vitest --project storybook --run`

Run: `pnpm --dir frontend lint`

Run: `pnpm --dir frontend build`

Run: `git diff --check`

Expected: 모두 종료 코드 0

- [ ] **Step 2: 변경 범위를 확인한다**

Run: `git status --short`

Run: `git diff --stat main...HEAD`

Expected: #129와 관계없는 파일이나 비밀값이 없음

- [ ] **Step 3: #129 완료 조건을 실제 검증 결과에 맞춰 체크한다**

실행하지 못한 실제 기기 또는 운영 환경 확인은 체크하지 않고 이유를 남긴다.
