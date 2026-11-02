# Course Detail Full-Map Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/courses/[courseId]`를 전체 화면 지도, 반투명 코스 정보 오버레이, 접힘·펼침 가능한 방문순서 시트로 재구성한다.

**Architecture:** `CourseDetailScreen`은 기존 데이터와 액션 상태를 유지하면서 지도·오버레이·시트를 조합한다. 코스 전용 방문순서 시트가 2단 위치와 포인터 제스처를 소유하며, `CourseMap`은 전체 화면에서 조작 가능한 지도와 기존 TMAP 도보 경로를 렌더링한다.

**Tech Stack:** Next.js 16.3.8 App Router, React 19.2.4, TypeScript 6, Tailwind CSS 4, NAVER Maps JavaScript API, Vitest 4, Storybook 10

**Spec:** `docs/superpowers/specs/2026-10-31-course-detail-map-layout-design.md`

## Global Constraints

- API 계약과 백엔드는 변경하지 않는다.
- 현재 TMAP 거리·시간 및 실제 도보 Polyline 정책을 유지한다.
- 기존 좋아요, 공개 전환, 공유, 수정·삭제, 상점 메뉴와 방문 기록 동작을 유지한다.
- 정보 카드는 닫기 버튼으로 축소하고 `코스 정보` 버튼으로 다시 열 수 있게 한다. 뒤로가기·공유·더보기는 항상 유지한다.
- 새 의존성을 추가하지 않는다.
- 320px, 390px, 480px 모바일 화면과 최대 너비 480px 앱 영역을 지원한다.
- 새 함수 바로 위에는 목적 또는 중요한 이유를 설명하는 짧은 주석을 둔다.
- 사용자 노출 문구는 존댓말을 사용한다.

## Review Focus

- 상점이 0개여도 접힌 시트가 열리고 빈 안내가 보이는지 Task 2 Storybook 테스트로 고정한다.
- 제목과 설명이 길어도 상단 카드가 하단 시트와 겹치지 않고 내부에서 잘리는지 Task 3 Storybook 뷰포트 검증으로 확인한다.
- 포인터 드래그 뒤 버튼 클릭이 중복 실행되지 않는지 Task 1 단위 테스트와 Task 2 상호작용 테스트로 고정한다.
- 지도 SDK 키 누락·로드 실패 상태가 전체 화면을 유지하는지 Task 3 Storybook 상태 검증으로 확인한다.
- 소유자와 타인 코스의 공개·좋아요 액션이 새 오버레이에서도 그대로 노출되는지 Task 3 기존 Storybook 시나리오로 고정한다.
- 정보 카드를 닫고 다시 열어도 상단 액션과 코스 정보가 복구되는지 Task 3 Storybook 상호작용 테스트로 고정한다.

---

### Task 1: 코스 방문순서 시트 제스처

**Files:**
- Create: `frontend/src/app/(main)/courses/[courseId]/_hooks/courseVisitOrderSheet/courseVisitOrderSheet.constants.ts`
- Create: `frontend/src/app/(main)/courses/[courseId]/_hooks/courseVisitOrderSheet/courseVisitOrderSheet.types.ts`
- Create: `frontend/src/app/(main)/courses/[courseId]/_hooks/courseVisitOrderSheet/courseVisitOrderSheet.ts`
- Create: `frontend/src/app/(main)/courses/[courseId]/_hooks/courseVisitOrderSheet/courseVisitOrderSheet.test.ts`
- Create: `frontend/src/app/(main)/courses/[courseId]/_hooks/courseVisitOrderSheet/useCourseVisitOrderSheetGesture.ts`
- Create: `frontend/src/app/(main)/courses/[courseId]/_hooks/courseVisitOrderSheet/index.ts`

**Interfaces:**
- Consumes: 부모 컨테이너 높이와 React Pointer Events
- Produces: `CourseVisitOrderSheetState = "collapsed" | "expanded"`, `getNextCourseVisitOrderSheetState(...)`, `useCourseVisitOrderSheetGesture({ state, onStateChange })`

- [x] **Step 1: 상태 결정 테스트를 작성한다**

  `courseVisitOrderSheet.test.ts`에 위로 40px 이상 드래그하면 `expanded`, 아래로 40px 이상 드래그하면 `collapsed`, 짧은 드래그는 중간 위치를 기준으로 스냅하는 테스트를 추가한다. 경계값 `40`과 접힌 이동 거리 `500`을 명시한다.

- [x] **Step 2: 테스트가 실패하는지 확인한다**

  Run: `pnpm --dir frontend test:unit -- 'src/app/(main)/courses/[courseId]/_hooks/courseVisitOrderSheet/courseVisitOrderSheet.test.ts'`
  Expected: FAIL because the module or exported function does not exist.

- [x] **Step 3: 순수 상태 계산과 상수를 구현한다**

  `COLLAPSED_HEIGHT = 200`, `EXPANDED_TOP_OFFSET = 128`, `DRAG_THRESHOLD = 40`, `DRAG_START_THRESHOLD = 5`, `SNAP_DURATION = 300`을 정의한다. `getNextCourseVisitOrderSheetState`는 임계 거리 우선, 그 외에는 중간점 기준으로 결과를 반환한다.

- [x] **Step 4: 상태 결정 테스트를 통과시킨다**

  Run: `pnpm --dir frontend test:unit -- 'src/app/(main)/courses/[courseId]/_hooks/courseVisitOrderSheet/courseVisitOrderSheet.test.ts'`
  Expected: PASS.

- [x] **Step 5: 포인터 제스처 훅을 구현한다**

  `useCourseVisitOrderSheetGesture`는 `sheetRef`, `listRef`, `initialTransform`, `toggleSheet`, 핸들 포인터 이벤트와 목록 클릭 캡처를 반환한다. `ResizeObserver`, `requestAnimationFrame`, `prefers-reduced-motion`을 사용해 부모 높이 변화와 스냅을 처리하고, 5px 이상 움직인 드래그 직후 클릭을 막는다.

- [x] **Step 6: 타입 검사와 단위 테스트를 확인한다**

  Run: `pnpm --dir frontend test:unit -- 'src/app/(main)/courses/[courseId]/_hooks/courseVisitOrderSheet/courseVisitOrderSheet.test.ts'`
  Expected: PASS with no TypeScript transform error.

- [x] **Step 7: 제스처 단위를 커밋한다**

  ```bash
  git add 'frontend/src/app/(main)/courses/[courseId]/_hooks/courseVisitOrderSheet'
  git commit -m "feat: add course visit order sheet gesture"
  ```

### Task 2: 방문순서 고정 시트

**Files:**
- Create: `frontend/src/app/(main)/courses/[courseId]/_components/CourseVisitOrderSheet.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx`

**Interfaces:**
- Consumes: Task 1의 `CourseVisitOrderSheetState`, `EXPANDED_TOP_OFFSET`, `useCourseVisitOrderSheetGesture`; `readonly CourseDetailShop[]`; `(shop, previousShop) => void`
- Produces: `CourseVisitOrderSheet({ shops, onOpenShopActions })`

- [x] **Step 1: 실패하는 Storybook 상호작용을 추가한다**

  기존 `OtherUserCourse` 시나리오에서 `방문 순서 펼치기` 버튼의 초기 `aria-expanded="false"`, 클릭 후 `aria-expanded="true"`, `방문 순서 접기` 이름을 검증한다. 상점이 없는 `EmptyCourse` 스토리에서 `아직 코스에 담긴 상점이 없습니다.`를 검증한다.

- [x] **Step 2: Storybook 테스트가 실패하는지 확인한다**

  Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'`
  Expected: FAIL because the two-stage sheet controls do not exist.

- [x] **Step 3: `CourseVisitOrderSheet`를 구현한다**

  시트는 초기 `collapsed`, 높이 `calc(100% - 128px)`, 접힌 높이 `200px`를 사용한다. 손잡이 버튼에 `aria-expanded`와 상태별 이름을 주고, 본문 `ol`은 펼친 상태에서 내부 스크롤된다. 기존 `CourseDetailShopItem`을 렌더링하고 현재 상점과 이전 상점을 콜백으로 전달한다.

- [x] **Step 4: Storybook 테스트를 통과시킨다**

  Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'`
  Expected: PASS for sheet toggle, empty course, and existing shop action scenarios.

- [x] **Step 5: 방문순서 시트를 커밋한다**

  ```bash
  git add 'frontend/src/app/(main)/courses/[courseId]/_components/CourseVisitOrderSheet.tsx' 'frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'
  git commit -m "feat: add course visit order bottom sheet"
  ```

### Task 3: 전체 화면 지도와 코스 정보 오버레이 통합

**Files:**
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseMap.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailHeader.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/loading.tsx`

**Interfaces:**
- Consumes: Task 2의 `CourseVisitOrderSheet`, 기존 `CourseDetailData`, 기존 코스 뮤테이션과 액션 콜백
- Produces: 전체 화면 `CourseDetailScreen`, 지도 오버레이형 `CourseDetailHeader`, 전체 크기 조작형 `CourseMap`

- [x] **Step 1: 새 레이아웃의 실패하는 Storybook 검증을 추가한다**

  `OtherUserCourse`에서 `코스 지도 화면` 영역, `코스 정보` 카드, 지역·제목·작성자·설명과 좋아요 액션이 함께 보이는지 검증한다. `코스 정보 닫기`를 누르면 카드가 사라지고 상단 액션과 `코스 정보` 복원 버튼은 남으며, 복원 버튼을 누르면 카드가 다시 보이는지 검증한다. `MyCourse`와 `RecommendedCourse`의 기존 액션 검증을 유지하고, 긴 제목·설명용 `LongContent`와 SDK 키 누락 상태에서도 전체 높이 컨테이너가 유지되는 스토리를 추가한다.

- [x] **Step 2: Storybook 테스트가 실패하는지 확인한다**

  Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'`
  Expected: FAIL because the full-map landmarks and overlay do not exist.

- [x] **Step 3: `CourseMap`을 전체 크기와 조작 가능한 지도로 변경한다**

  외곽 컨테이너를 `absolute inset-0` 또는 부모를 채우는 `size-full`로 바꾸고 카드 모서리를 제거한다. `draggable`, `scrollWheel`, `pinchZoom`, `keyboardShortcuts`, `disableDoubleClickZoom`의 기존 비활성 값을 제거하거나 활성화해 지도 이동·확대를 허용한다. 마커, Polyline, `fitBounds`, SDK 상태와 정리 로직은 유지한다.

- [x] **Step 4: `CourseDetailHeader`를 오버레이 카드로 변경한다**

  상단 액션은 독립된 반투명 원형 버튼으로 배치한다. 정보 영역은 `rounded-card`, `bg-white/85`, 약한 그림자, `backdrop-blur`를 사용하고 지역, 제목, 작성자·날짜, 설명, 공개 상태 또는 좋아요를 포함한다. `CourseDetailScreen`이 정보 카드 열림 상태를 소유하고, 카드의 닫기 버튼과 축소 상태의 `코스 정보` 복원 버튼을 연결한다. 긴 설명은 카드 높이를 과도하게 키우지 않도록 줄 수를 제한한다.

- [x] **Step 5: `CourseDetailScreen`과 로딩 화면을 전체 지도 구조로 조합한다**

  최상위를 `relative h-dvh min-h-[560px] overflow-hidden`으로 바꾸고 `CourseMap`, 상단 `CourseDetailHeader`, `CourseVisitOrderSheet` 순서로 겹친다. 기존 `selectedShop`, 네이버 길찾기, 좋아요·공개·삭제·방문 뮤테이션과 대화상자형 시트는 그대로 연결한다. 로딩 화면도 `h-dvh`를 유지한다.

- [x] **Step 6: Storybook 테스트를 통과시킨다**

  Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'`
  Expected: PASS for full-map layout, owner/other/recommended actions, long content, empty course, and shop actions.

- [x] **Step 7: 320px, 390px, 480px에서 시각·키보드 검증한다**

  Storybook 브라우저에서 각 너비로 상단 카드와 접힌/펼친 시트가 겹치지 않는지, 손잡이와 상점 메뉴에 Tab 포커스가 보이는지, 지도를 드래그할 수 있는지 확인한다.

- [x] **Step 8: 전체 화면 통합을 커밋한다**

  ```bash
  git add 'frontend/src/app/(main)/courses/[courseId]/_components' 'frontend/src/app/(main)/courses/[courseId]/loading.tsx'
  git commit -m "feat: redesign course detail as full map"
  ```

### Task 4: 전체 검증과 문서 반영

**Files:**
- Modify: `docs/superpowers/plans/2026-10-31-course-detail-map-layout.md`
- Track: `docs/superpowers/specs/2026-10-31-course-detail-map-layout-design.md`

**Interfaces:**
- Consumes: Tasks 1-3의 완성된 UI
- Produces: 검증 결과가 반영된 구현 브랜치

- [x] **Step 1: 프론트엔드 단위 테스트를 실행한다**

  Run: `pnpm --dir frontend test:unit`
  Expected: all tests PASS.

- [x] **Step 2: 전체 Storybook 테스트를 실행한다**

  Run: `pnpm --dir frontend exec vitest --project storybook --run`
  Expected: all stories PASS.

- [x] **Step 3: 린트를 실행한다**

  Run: `pnpm --dir frontend lint`
  Expected: exit 0 with no errors.

- [x] **Step 4: 프로덕션 빌드를 실행한다**

  Run: `pnpm --dir frontend build`
  Expected: Next.js build completes successfully.

- [x] **Step 5: 변경 범위와 공백 오류를 확인한다**

  Run: `git diff --check && git status --short`
  Expected: no whitespace errors; only the approved course detail UI and its spec/plan files are present.

- [x] **Step 6: 계획 체크박스와 검증 결과를 반영해 문서를 커밋한다**

  ```bash
  git add docs/superpowers/specs/2026-10-31-course-detail-map-layout-design.md docs/superpowers/plans/2026-10-31-course-detail-map-layout.md
  git commit -m "docs: record course detail map layout design"
  ```

## Verification Results

- `pnpm --dir frontend test:unit`: 20 files, 91 tests passed.
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 pnpm --dir frontend exec vitest --project storybook --run`: 28 files, 145 tests passed.
- `pnpm --dir frontend lint`: passed with no errors.
- `pnpm --dir packages build`: passed and refreshed the target branch's shared type output before the frontend build.
- Final self-review fixed two regressions with RED→GREEN coverage: collapsed sheet controls are removed from the accessibility tree, and empty courses initialize the map at a safe default center.
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 pnpm --dir frontend build`: Turbopack failed while binding its internal PostCSS worker port with `Operation not permitted` in this execution environment.
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 pnpm --dir frontend exec next build --webpack`: passed, including compilation, TypeScript, and 12 static pages.
- Playwright Chromium: 320px, 390px, 480px에서 정보 카드와 접힌 시트가 겹치지 않았고 첫 Tab 포커스, 정보 카드 닫기·복원을 확인했다.
