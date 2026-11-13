# Public Course Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 소품지도 추천 코스와 사용자 공개 코스를 홈에서 매일 발견하고 `/courses`에서 지역별 최신순·인기순으로 탐색하게 한다.

**Architecture:** `@sopum-map/shared`에 공개 목록 계약을 먼저 고정하고, MongoDB의 코스 문서에 정렬용 좋아요 수와 Pick 상태를 유지한다. 백엔드는 공개 목록과 한국 날짜 기준 홈 추천을 별도 서비스로 제공하며, 프론트엔드는 같은 코스 카드와 React Query 캐시를 홈과 목록 화면에서 공유한다.

**Tech Stack:** TypeScript 6, Mongoose 9, Express 5, Zod 4, Next.js 16 App Router, React 19, TanStack Query 5, Vitest 4, Storybook 10

**Spec:** `docs/superpowers/specs/2026-11-11-public-course-discovery-design.md`

## Global Constraints

- 노출 대상은 `recommended && isPublic` 또는 `user_created && isPublic` 코스다.
- 추천 코스와 사용자 공개 코스는 별도 할당량 없이 같은 정렬·추천 기준으로 경쟁한다.
- 홈은 한국 시간 자정 이전 데이터로 최신 10개와 최근 7일 좋아요 상위 10개를 섞고, 모든 사용자에게 같은 3개를 하루 동안 보여준다.
- 홈은 날짜별 정렬 후보 ID를 MongoDB 스냅샷으로 저장해 좋아요 해제와 서버 재시작 뒤에도 같은 후보를 사용한다.
- 홈의 3개는 서로 다른 `regionGroup`을 우선하고 부족하면 같은 지역으로 채운다.
- `/courses` 기본값은 전체 지역·최신순이며 인기순은 `likeCount`, `createdAt`, `_id` 내림차순이다.
- 목록은 커서 기반 무한 스크롤이고 필터·정렬은 URL에 보존한다.
- 공개 목록 응답은 사용자별 `isLiked`를 포함하지 않는다.
- Pick은 공개 사용자 코스에만 표시하며 비공개 전환 시 해제한다. 운영자 관리 API는 만들지 않는다.
- 대표 태그는 포함 상점의 `tagStats[].key`가 등장한 상점 수로 계산하며 `tagStats[].count`를 합산하지 않는다.
- 새 의존성을 추가하지 않는다.
- Next.js 파일을 수정하기 전 `frontend/node_modules/next/dist/docs/`에서 App Router와 `searchParams` 문서를 읽는다.
- 모든 새 함수 바로 위에 목적이나 중요한 이유를 설명하는 짧은 주석을 둔다.

## Review Focus

- 손상되었거나 정렬 방식이 다른 커서는 `INVALID_COURSE_CURSOR`로 거부되어야 한다. Task 3의 커서 테스트가 이를 고정한다.
- 작성자나 일부 상점 이미지·태그가 없어도 공개 목록 항목은 기본값으로 표시되어야 한다. Task 3의 매퍼 테스트가 이를 고정한다.
- 같은 사용자의 중복 좋아요와 중복 해제가 `likeCount`를 두 번 바꾸지 않아야 한다. Task 2의 서비스 테스트가 이를 고정한다.
- 한국 시간 자정 경계와 비공개 전환은 하루 추천의 안정성보다 공개 안전성을 우선해야 한다. Task 5의 추천 테스트가 이를 고정한다.
- 사용자가 지역·정렬을 빠르게 바꿔도 이전 쿼리 페이지가 새 목록에 섞이지 않아야 한다. Task 9의 화면 스토리와 쿼리 키 테스트가 이를 고정한다.

---

### Task 1: 공개 코스 공용 계약

**Files:**
- Modify: `packages/shared/src/course/course.constants.ts`
- Modify: `packages/shared/src/course/course.types.ts`
- Modify: `packages/shared/src/course/course.api.types.ts`
- Modify: `backend/src/services/course/course.read.service.ts`
- Modify: `frontend/src/api/course/course.query.test.ts`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx`

**Interfaces:**
- Consumes: 기존 `CourseType`, `CourseAuthor`, `CourseCursorPage`, `ShopRegionGroup`, `TagKey`
- Produces: `PUBLIC_COURSE_SORTS`, `PublicCourseSort`, `PublicCourseListItem`, `GetPublicCoursesQuery`, `PublicCourseListData`, `HomeCourseRecommendationsData`, `CourseDetailData.isOfficialPick`

- [ ] **Step 1: 공용 계약을 사용하는 타입 검사 지점을 먼저 추가**

  `course.api.types.ts`에 아래 정확한 모양의 타입을 선언하고 기존 상세 fixture가 `isOfficialPick` 없이는 컴파일되지 않게 한다.

  ```ts
  export type PublicCourseListItem = Readonly<{
    id: string;
    courseType: CourseType;
    title: string;
    description: string | null;
    regionGroup: ShopRegionGroup;
    imageUrls: readonly string[];
    representativeTagKeys: readonly TagKey[];
    author: CourseAuthor;
    likeCount: number;
    isOfficialPick: boolean;
    createdAt: string;
  }>;
  ```

- [ ] **Step 2: 세 패키지 빌드로 실패 확인**

  Run: `pnpm --dir packages build && pnpm --dir backend build && pnpm --dir frontend build`

  Expected: `PublicCourseSort` 또는 기존 상세 fixture의 새 필드가 없어 타입 오류 발생.

- [ ] **Step 3: 상수와 요청·응답 타입 완성**

  `PUBLIC_COURSE_SORTS = ["latest", "popular"] as const`, `PublicCourseSort`, 기본 목록 쿼리와 아래 데이터 타입을 추가한다.

  ```ts
  export type PublicCourseListData = CourseCursorPage<PublicCourseListItem>;
  export type HomeCourseRecommendationsData = Readonly<{
    items: readonly PublicCourseListItem[];
  }>;
  ```

  `CourseDetailData`에는 `isOfficialPick: boolean`을 추가한다. 아직 모델 필드를 추가하지 않는 이 작업에서는 상세 서비스 반환값과 기존 프론트엔드 fixture에 `isOfficialPick: false`를 넣어 계약 변경 뒤에도 세 패키지가 함께 컴파일되게 한다. 공용 패키지의 기존 `index.ts` export 구조는 유지한다.

- [ ] **Step 4: 세 패키지 타입 검사**

  Run: `pnpm --dir packages build && pnpm --dir backend build && pnpm --dir frontend build`

  Expected: PASS.

- [ ] **Step 5: 커밋**

  ```bash
  git add packages/shared/src/course backend/src/services/course/course.read.service.ts frontend/src/api/course/course.query.test.ts 'frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'
  git commit -m "feat: 공개 코스 탐색 계약 추가"
  ```

### Task 2: 좋아요 수와 Pick 상태 영속화

**Files:**
- Modify: `backend/src/models/course.model.ts`
- Modify: `backend/src/models/course.model.test.ts`
- Modify: `backend/src/services/course/course-like.service.ts`
- Modify: `backend/src/services/course/course-like.service.test.ts`
- Modify: `backend/src/services/course/course-visibility.service.ts`
- Modify: `backend/src/services/course/course-visibility.service.test.ts`
- Modify: `backend/src/services/course/course.read.service.ts`
- Modify: `backend/src/services/course/course.read.service.test.ts`
- Modify: `backend/src/services/course/course-list.service.ts`
- Create: `backend/src/services/course/course-list.service.test.ts`
- Create: `backend/src/scripts/backfill-course-like-counts.ts`
- Create: `backend/src/scripts/backfill-course-like-counts.test.ts`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: Task 1의 `CourseDetailData.isOfficialPick`
- Produces: `Course.likeCount`, `Course.isOfficialPick`, `createCourseLikeCountUpdates(counts, courseIds)`, `backfill:course-like-counts` 스크립트

- [ ] **Step 1: 모델·좋아요·공개 상태 실패 테스트 작성**

  다음 이름과 핵심 단언을 추가한다.

  ```ts
  it("새 코스는 likeCount 0과 isOfficialPick false를 사용한다", ...)
  it("중복 좋아요는 likeCount를 한 번만 증가시킨다", ...)
  it("존재하는 좋아요만 likeCount를 감소시키고 0 아래로 내리지 않는다", ...)
  it("비공개 전환은 isOfficialPick도 false로 바꾼다", ...)
  it("상세는 저장된 likeCount와 유효한 Pick 상태를 반환한다", ...)
  ```

  상세의 Pick은 `courseType === "user_created" && isPublic && isOfficialPick`일 때만 `true`라고 단언한다.

  내 코스와 찜한 코스 목록도 `CourseLike`를 다시 집계하지 않고 저장된 `course.likeCount ?? 0`을 반환한다고 단언한다.

- [ ] **Step 2: 관련 백엔드 테스트로 실패 확인**

  Run: `pnpm --dir backend exec vitest run src/models/course.model.test.ts src/services/course/course-like.service.test.ts src/services/course/course-visibility.service.test.ts src/services/course/course.read.service.test.ts src/services/course/course-list.service.test.ts`

  Expected: 새 필드와 카운터 갱신이 없어 FAIL.

- [ ] **Step 3: 모델과 서비스 구현**

  `course.model.ts`에 정수·최솟값 0인 `likeCount`와 기본값 false인 `isOfficialPick`을 추가한다. 좋아요 upsert의 `upsertedCount`와 해제의 `deletedCount`가 1일 때만 코스 문서에 `$inc`를 적용하고, 반환값은 갱신된 코스의 `likeCount`를 사용한다. 상세·내 코스·찜한 코스 목록은 `CourseLike.countDocuments`나 목록별 집계 대신 저장된 `course.likeCount ?? 0`을 사용한다. 비공개 전환 update는 `{ isPublic: false, isOfficialPick: false }`를 함께 저장한다.

- [ ] **Step 4: 안전한 백필 스크립트와 테스트 작성**

  `createCourseLikeCountUpdates`는 코스 ID 전체와 `CourseLike` 집계 결과를 받아 좋아요 없는 코스도 0으로 만드는 bulk update 목록을 반환한다. 스크립트는 기본 dry-run이고 `--apply`일 때만 `bulkWrite`와 `syncIndexes`를 실행한다. `backend/package.json`에 `backfill:course-like-counts`를 추가한다.

- [ ] **Step 5: Task 2 백엔드 테스트 실행**

  Run: `pnpm --dir backend exec vitest run src/scripts/backfill-course-like-counts.test.ts src/models/course.model.test.ts src/services/course/course-like.service.test.ts src/services/course/course-visibility.service.test.ts src/services/course/course.read.service.test.ts src/services/course/course-list.service.test.ts`

  Expected: PASS, 중복 요청에서 카운터가 한 번만 바뀌고 누락 코스가 0으로 백필됨.

- [ ] **Step 6: 커밋**

  ```bash
  git add backend/src/models/course.model.ts backend/src/models/course.model.test.ts backend/src/services/course backend/src/scripts/backfill-course-like-counts.ts backend/src/scripts/backfill-course-like-counts.test.ts backend/package.json
  git commit -m "feat: 코스 좋아요 수와 Pick 상태 저장"
  ```

### Task 3: 공개 목록 커서·표시 데이터·조회 서비스

**Files:**
- Create: `backend/src/services/course/public-course-cursor.ts`
- Create: `backend/src/services/course/public-course-cursor.test.ts`
- Create: `backend/src/services/course/public-course-list.mapper.ts`
- Create: `backend/src/services/course/public-course-list.mapper.test.ts`
- Create: `backend/src/services/course/public-course-display.service.ts`
- Create: `backend/src/services/course/public-course-list.service.ts`
- Create: `backend/src/services/course/public-course-list.service.test.ts`
- Modify: `backend/src/models/course.model.ts`

**Interfaces:**
- Consumes: Task 1의 `GetPublicCoursesQuery`, `PublicCourseListData`, `PublicCourseListItem`; Task 2의 `likeCount`, `isOfficialPick`
- Produces: `encodePublicCourseCursor`, `decodePublicCourseCursor`, `selectRepresentativeTagKeys`, `loadPublicCourseListItems`, `getPublicCourseList`

- [ ] **Step 1: 커서와 대표 태그 실패 테스트 작성**

  다음 동작을 고정한다.

  ```ts
  decodePublicCourseCursor(encodePublicCourseCursor(popularCursor), "popular")
  // => likeCount, createdAt, id, sort를 보존

  decodePublicCourseCursor(latestCursor, "popular")
  // => INVALID_COURSE_CURSOR

  selectRepresentativeTagKeys(shops)
  // => 상점별 등장 횟수 내림차순, TAG_DEFINITIONS 순서 동률 처리, 최대 2개
  ```

  한 상점에서 `tagStats.count`가 큰 태그보다 여러 상점에 한 번씩 등장한 태그가 먼저 선택되는 fixture를 포함한다.

- [ ] **Step 2: 매퍼와 목록 서비스 실패 테스트 작성**

  공개·비공개 fixture를 섞어 아래를 단언한다.

  - `isPublic: false` 사용자 코스는 제외한다.
  - 최신순은 `createdAt`, `_id` 순서를 사용한다.
  - 인기순은 `likeCount`, `createdAt`, `_id` 순서를 사용한다.
  - 지역 필터와 `limit + 1` 커서 페이지를 적용한다.
  - 작성자 누락은 `알 수 없는 사용자`, 이미지 누락은 빈 `imageUrls`, 태그 누락은 빈 배열이다.
  - 포함 상점 문서 일부가 없어도 남은 이미지·태그로 코스 항목을 반환한다.
  - 이미지가 5개 이상이어도 방문 순서 기준 4개만 반환한다.
  - 추천 코스에 DB 값 `isOfficialPick: true`가 있어도 응답은 false다.
  - 목록 하나를 만들 때 사용자 조회 한 번과 상점 조회 한 번만 실행한다.

- [ ] **Step 3: 테스트 실패 확인**

  Run: `pnpm --dir backend exec vitest run src/services/course/public-course-cursor.test.ts src/services/course/public-course-list.mapper.test.ts src/services/course/public-course-list.service.test.ts`

  Expected: 새 모듈이 없어 FAIL.

- [ ] **Step 4: 공개 목록 조회 구현**

  ```ts
  export function encodePublicCourseCursor(input: PublicCourseCursor): string;
  export function decodePublicCourseCursor(cursor: string, expectedSort: PublicCourseSort): PublicCourseCursor;
  export function selectRepresentativeTagKeys(shops: readonly ShopTagSource[]): readonly TagKey[];
  export async function loadPublicCourseListItems(courses: readonly PublicCourseDocument[]): Promise<readonly PublicCourseListItem[]>;
  export async function getPublicCourseList(query: GetPublicCoursesQuery): Promise<PublicCourseListData>;
  ```

  `loadPublicCourseListItems`는 사용자와 포함 상점을 각각 한 번의 묶음 쿼리로 가져온다. 상점은 `images`와 `tagStats`만 선택한다. 코스 모델에는 `{ isPublic, createdAt, _id }`, `{ isPublic, regionGroup, createdAt, _id }`, `{ isPublic, likeCount, createdAt, _id }`, `{ isPublic, regionGroup, likeCount, createdAt, _id }` 순서의 복합 인덱스를 추가하고, 누락 `likeCount`는 매핑에서 0으로 취급한다.

- [ ] **Step 5: 공개 목록 서비스 테스트 실행**

  Run: `pnpm --dir backend exec vitest run src/services/course/public-course-cursor.test.ts src/services/course/public-course-list.mapper.test.ts src/services/course/public-course-list.service.test.ts`

  Expected: PASS.

- [ ] **Step 6: 커밋**

  ```bash
  git add backend/src/models/course.model.ts backend/src/services/course/public-course-*
  git commit -m "feat: 공개 코스 목록 조회 서비스 추가"
  ```

### Task 4: 공개 목록 API 경계

**Files:**
- Modify: `backend/src/validations/course.validation.ts`
- Modify: `backend/src/validations/course.validation.test.ts`
- Modify: `backend/src/controllers/course.controller.ts`
- Modify: `backend/src/routes/course.routes.ts`
- Modify: `backend/src/routes/course.routes.test.ts`

**Interfaces:**
- Consumes: Task 3의 `getPublicCourseList(query)`
- Produces: 인증된 `GET /api/courses?regionGroup=&sort=&cursor=&limit=`

- [ ] **Step 1: 검증과 라우트 실패 테스트 작성**

  `getPublicCoursesSchema`가 `{ sort: "latest", limit: 20 }` 기본값을 만들고, 잘못된 지역·정렬·빈 커서·21 이상의 limit을 거부한다고 단언한다. 라우트 테스트는 인증된 GET이 검증된 query로 서비스를 호출하고, 미인증은 401이며 서비스가 호출되지 않는다고 단언한다.

- [ ] **Step 2: 실패 확인**

  Run: `pnpm --dir backend exec vitest run src/validations/course.validation.test.ts src/routes/course.routes.test.ts`

  Expected: `getPublicCoursesSchema`와 GET 라우트가 없어 FAIL.

- [ ] **Step 3: 검증·컨트롤러·라우트 구현**

  ```ts
  export const getPublicCoursesSchema: z.ZodType<...>;
  export async function getPublicCoursesController(req: Request, res: Response, next: NextFunction): Promise<void>;
  ```

  `courseRouter.get("/", requireAuth, validateRequest(getPublicCoursesSchema), getPublicCoursesController)`를 POST `/`와 동적 `/:courseId`보다 앞에 등록한다. 성공 응답은 `{ success: true, data }`다.

- [ ] **Step 4: 검증·라우트·빌드 확인**

  Run: `pnpm --dir backend exec vitest run src/validations/course.validation.test.ts src/routes/course.routes.test.ts && pnpm --dir backend build`

  Expected: PASS.

- [ ] **Step 5: 커밋**

  ```bash
  git add backend/src/validations/course.validation.ts backend/src/validations/course.validation.test.ts backend/src/controllers/course.controller.ts backend/src/routes/course.routes.ts backend/src/routes/course.routes.test.ts
  git commit -m "feat: 공개 코스 목록 API 추가"
  ```

### Task 5: 날짜별 홈 추천 API

**Files:**
- Modify: `backend/src/utils/korea-date.ts`
- Modify: `backend/src/utils/korea-date.test.ts`
- Create: `backend/src/services/course/course-home-recommendation.ts`
- Create: `backend/src/services/course/course-home-recommendation.test.ts`
- Create: `backend/src/services/course/course-home.service.ts`
- Create: `backend/src/services/course/course-home.service.test.ts`
- Create: `backend/src/models/course-home-recommendation.model.ts`
- Create: `backend/src/models/course-home-recommendation.model.test.ts`
- Modify: `backend/src/models/course-like.model.ts`
- Modify: `backend/src/controllers/course.controller.ts`
- Modify: `backend/src/routes/course.routes.ts`
- Modify: `backend/src/routes/course.routes.test.ts`

**Interfaces:**
- Consumes: Task 3의 `loadPublicCourseListItems`
- Produces: `CourseHomeRecommendationModel`, `getKoreaDayWindow`, `mergeTrendingCandidates`, `orderCandidatesForDate`, `selectRegionDiverseCourses`, `getOrCreateHomeCourseSnapshot`, `getHomeCourseRecommendations`, 인증된 `GET /api/courses/home`

- [ ] **Step 1: 한국 날짜와 추천 알고리즘 실패 테스트 작성**

  아래 경계를 고정한다.

  - `2026-11-10T15:00:00.000Z`는 한국 날짜 `2026-11-11`의 시작이다.
  - 최신 후보 최대 10개와 최근 좋아요 후보 최대 10개를 먼저 취하고 중복·부족분을 남은 두 목록에서 번갈아 채운다.
  - 같은 날짜와 후보는 항상 같은 순서고 날짜가 바뀌면 해시 순서가 바뀐다.
  - 세 지역 이상이면 서로 다른 세 지역을 고르고, 두 지역뿐이면 중복을 허용해 세 자리를 채운다.
  - 같은 날짜 키는 하나의 스냅샷만 허용하고 오래된 스냅샷은 TTL 정리 대상이다.

- [ ] **Step 2: 홈 서비스·라우트 실패 테스트 작성**

  `now = 2026-11-11T03:00:00.000Z` fixture에서 최신 코스는 `createdAt < 2026-11-10T15:00:00.000Z`, 최근 좋아요는 그 시각 직전 7일만 집계한다고 단언한다. 첫 요청은 정렬된 후보 ID 최대 20개를 날짜 키로 저장하고, 다음 요청은 좋아요 문서가 바뀌어도 스냅샷을 재사용한다. 저장된 후보 중 비공개·삭제 코스는 제외하고 다음 후보로 채운다. 라우트는 모든 인증 사용자에게 같은 service 결과를 반환한다고 단언한다.

- [ ] **Step 3: 실패 확인**

  Run: `pnpm --dir backend exec vitest run src/utils/korea-date.test.ts src/models/course-home-recommendation.model.test.ts src/services/course/course-home-recommendation.test.ts src/services/course/course-home.service.test.ts src/routes/course.routes.test.ts`

  Expected: 새 날짜·추천 함수와 `/home` 라우트가 없어 FAIL.

- [ ] **Step 4: 홈 추천과 정적 라우트 구현**

  날짜별 순서는 Node `crypto`의 SHA-256으로 `${dateKey}:${courseId}`를 해시해 사전순 정렬한다.

  ```ts
  export async function getHomeCourseRecommendations(now = new Date()): Promise<HomeCourseRecommendationsData>;
  ```

  최근 좋아요 집계는 `CourseLike.createdAt` 범위를 먼저 제한하고 코스 공개 상태를 확인한다. `CourseLike`에는 `{ createdAt: -1, courseId: 1 }` 인덱스를 추가한다. 홈 스냅샷은 `dateKey` 고유 인덱스와 `expiresAt`의 `expireAfterSeconds: 0` TTL 인덱스를 사용하고, `expiresAt`은 해당 한국 날짜 시작으로부터 14일 뒤로 저장하며 정렬된 `candidateCourseIds` 최대 20개를 보관한다. 동시 첫 요청은 upsert 뒤 실제 저장된 문서를 다시 읽는다. `/home` 라우트는 반드시 `/:courseId`보다 앞에 둔다.

- [ ] **Step 5: 홈 추천 테스트 실행**

  Run: `pnpm --dir backend exec vitest run src/utils/korea-date.test.ts src/models/course-home-recommendation.model.test.ts src/services/course/course-home-recommendation.test.ts src/services/course/course-home.service.test.ts src/routes/course.routes.test.ts`

  Expected: PASS, 같은 날짜의 사용자별 요청 결과가 동일함.

- [ ] **Step 6: 커밋**

  ```bash
  git add backend/src/utils/korea-date.ts backend/src/utils/korea-date.test.ts backend/src/models/course-home-recommendation.model.ts backend/src/models/course-home-recommendation.model.test.ts backend/src/models/course-like.model.ts backend/src/services/course/course-home-* backend/src/controllers/course.controller.ts backend/src/routes/course.routes.ts backend/src/routes/course.routes.test.ts
  git commit -m "feat: 날짜별 홈 코스 추천 API 추가"
  ```

### Task 6: 프론트엔드 공개 코스 API와 쿼리

**Files:**
- Modify: `frontend/src/api/course/course.api.ts`
- Create: `frontend/src/api/course/course.api.test.ts`
- Modify: `frontend/src/api/course/course.query.ts`
- Modify: `frontend/src/api/course/course.query.test.ts`
- Create: `frontend/src/utils/korea-date.ts`
- Create: `frontend/src/utils/korea-date.test.ts`

**Interfaces:**
- Consumes: Task 1의 공개 목록 타입, Task 4와 5의 HTTP API
- Produces: `getPublicCourses`, `getHomeCourseRecommendations`, `courseKeys.publicList`, `courseKeys.home`, `useInfinitePublicCourses`, `useHomeCourseRecommendations`

- [ ] **Step 1: API 경로와 쿼리 키 실패 테스트 작성**

  다음을 단언한다.

  - 전체·최신순은 `/courses?sort=latest&limit=20`을 호출한다.
  - 지역·인기순·커서는 모두 URLSearchParams에 들어간다.
  - 홈은 `/courses/home`을 호출한다.
  - 공개 목록 쿼리 키는 `regionGroup` 또는 `sort`가 바뀌면 달라진다.
  - 한국 날짜 키는 UTC 15시 경계에서 바뀐다.

- [ ] **Step 2: 실패 확인**

  Run: `pnpm --dir frontend test:unit -- src/api/course/course.api.test.ts src/api/course/course.query.test.ts src/utils/korea-date.test.ts`

  Expected: 새 함수와 키가 없어 FAIL.

- [ ] **Step 3: API 함수와 React Query 훅 구현**

  ```ts
  export async function getPublicCourses(query: GetPublicCoursesQuery): Promise<PublicCourseListData>;
  export async function getHomeCourseRecommendations(): Promise<HomeCourseRecommendationsData>;
  export function useInfinitePublicCourses(query: Omit<GetPublicCoursesQuery, "cursor">): UseInfiniteQueryResult<...>;
  export function useHomeCourseRecommendations(): UseQueryResult<HomeCourseRecommendationsData>;
  ```

  홈 훅은 마운트 시 한국 날짜 키를 만들고 `visibilitychange`로 화면이 다시 활성화될 때만 키를 갱신한다. 쿼리 키에 날짜 키를 넣어 자정 이전 응답과 다음 날 응답을 분리한다. 공개 목록 쿼리 키에는 지역과 정렬을 모두 넣는다.

- [ ] **Step 4: 단위 테스트와 타입 검사**

  Run: `pnpm --dir frontend test:unit -- src/api/course/course.api.test.ts src/api/course/course.query.test.ts src/utils/korea-date.test.ts && pnpm --dir frontend build`

  Expected: PASS.

- [ ] **Step 5: 커밋**

  ```bash
  git add frontend/src/api/course frontend/src/utils/korea-date.ts frontend/src/utils/korea-date.test.ts
  git commit -m "feat: 공개 코스 프론트 쿼리 추가"
  ```

### Task 7: 공개 코스 카드와 Pick 상세 표시

**Files:**
- Modify: `frontend/src/components/ui/CourseListItem/CourseListItem.type.ts`
- Modify: `frontend/src/components/ui/CourseListItem/CourseListItem.tsx`
- Modify: `frontend/src/components/ui/CourseListItem/CourseListItem.stories.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailHeader.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx`

**Interfaces:**
- Consumes: Task 1의 `PublicCourseListItem`과 `CourseDetailData.isOfficialPick`
- Produces: `CourseListItem({ course, imageLoading })` 공개 카드 UI

- [ ] **Step 1: Storybook 실패 상태 추가**

  스토리에 다음 상태와 play 단언을 추가한다.

  - 추천 코스: `by 소품지도`, Pick 뱃지 없음
  - 일반 사용자 코스: `by 닉네임`
  - 사용자 Pick 코스: `소품지도 Pick` 뱃지 있음
  - 이미지 5개 입력: DOM 이미지 4개
  - 대표 태그 3개 입력: 표시 2개
  - 설명 없음: 불필요한 `·` 없음
  - 하트 옆 좋아요 수 표시
  - 긴 제목·설명·닉네임을 넣은 320px viewport

- [ ] **Step 2: Storybook 테스트 실패 확인**

  Run: `pnpm --dir frontend exec vitest --project storybook --run src/components/ui/CourseListItem/CourseListItem.stories.tsx`

  Expected: 기존 Props와 UI에는 작성자·Pick·좋아요가 없어 FAIL.

- [ ] **Step 3: 카드와 상세 Pick 표시 구현**

  `CourseListItemProps`는 `course: PublicCourseListItem`과 선택적인 `imageLoading`만 받는다. 카드가 공용 `SHOP_REGION_GROUP_LABELS`, `TAG_DEFINITION_BY_KEY`, `HeartIcon`, `Badge`를 사용해 콜라주와 메타데이터를 표시하게 한다. 상세 헤더는 유효한 `course.isOfficialPick`일 때 같은 문구의 Pick 뱃지를 표시한다.

- [ ] **Step 4: Storybook 검증**

  Run: `pnpm --dir frontend exec vitest --project storybook --run src/components/ui/CourseListItem/CourseListItem.stories.tsx 'src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'`

  Expected: PASS, 320px에서 가로 스크롤이나 이미지 침범 없음.

- [ ] **Step 5: 커밋**

  ```bash
  git add frontend/src/components/ui/CourseListItem 'frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailHeader.tsx' 'frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'
  git commit -m "feat: 공개 코스 카드와 Pick 표시 추가"
  ```

### Task 8: 홈 추천 코스 연결

**Files:**
- Modify: `frontend/src/app/(main)/(tabs)/_home/components/HomeCourseSection.tsx`
- Create: `frontend/src/app/(main)/(tabs)/_home/components/HomeCourseSectionBoundary.tsx`
- Create: `frontend/src/app/(main)/(tabs)/_home/components/HomeCourseSection.stories.tsx`
- Modify: `frontend/src/app/(main)/(tabs)/_home/components/HomeSkeleton.tsx`

**Interfaces:**
- Consumes: Task 6의 `useHomeCourseRecommendations`, Task 7의 `CourseListItem`
- Produces: 실제 데이터 기반 홈 `추천 산책 코스` 섹션과 `/courses` 더 보기 링크

- [ ] **Step 1: 홈 섹션 Storybook 상태 작성**

  QueryClient fixture로 정상 3개, 0개, pending, error를 만든다. 정상 상태는 지역이 다른 세 카드와 `/courses` 링크를 단언하고, 오류 상태는 `다시 시도`, 빈 상태는 공개 코스 안내를 단언한다. Boundary fixture는 자식 렌더 오류가 홈 밖으로 전파되지 않는다고 단언한다.

- [ ] **Step 2: 실패 확인**

  Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/(tabs)/_home/components/HomeCourseSection.stories.tsx'`

  Expected: mock 상수와 비링크 `더 보기` 때문에 FAIL.

- [ ] **Step 3: 홈 섹션 구현**

  `MOCK_COURSES`를 제거하고 쿼리의 `items`를 렌더링한다. 초기 로딩은 카드 크기의 스켈레톤, 오류는 재시도, 빈 결과는 짧은 안내를 표시한다. `더 보기`는 `Link href="/courses"`로 바꾸고 섹션을 Error Boundary로 감싼다.

- [ ] **Step 4: Storybook 검증**

  Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/(tabs)/_home/components/HomeCourseSection.stories.tsx'`

  Expected: PASS.

- [ ] **Step 5: 커밋**

  ```bash
  git add 'frontend/src/app/(main)/(tabs)/_home/components/HomeCourseSection.tsx' 'frontend/src/app/(main)/(tabs)/_home/components/HomeCourseSectionBoundary.tsx' 'frontend/src/app/(main)/(tabs)/_home/components/HomeCourseSection.stories.tsx' 'frontend/src/app/(main)/(tabs)/_home/components/HomeSkeleton.tsx'
  git commit -m "feat: 홈 추천 코스를 공개 API에 연결"
  ```

### Task 9: `/courses` 공개 탐색 화면

**Files:**
- Create: `frontend/src/app/(main)/courses/page.tsx`
- Create: `frontend/src/app/(main)/courses/_components/PublicCoursesScreen.tsx`
- Create: `frontend/src/app/(main)/courses/_components/PublicCoursesScreen.stories.tsx`
- Create: `frontend/src/app/(main)/courses/_utils/public-course-search-params.ts`
- Create: `frontend/src/app/(main)/courses/_utils/public-course-search-params.test.ts`

**Interfaces:**
- Consumes: Task 6의 `useInfinitePublicCourses`, Task 7의 `CourseListItem`, 기존 `FilterChipGroup`, `StatePanel`, `useInfiniteScroll`
- Produces: URL 기반 지역·정렬 필터가 있는 `/courses` 목록 페이지

- [ ] **Step 1: 설치된 Next.js 문서 확인**

  Run: `sed -n '1,240p' frontend/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`

  Expected: Next.js 16의 비동기 `searchParams`와 App Router 페이지 규칙 확인.

- [ ] **Step 2: URL 파서 단위 테스트 작성**

  `parsePublicCourseSearchParams`가 빈 값과 잘못된 값은 `{ sort: "latest" }`로 복구하고, 단일 유효 `regionGroup`과 `popular`을 보존하며 배열형 중복 값은 첫 유효 값만 사용한다고 단언한다.

  Run: `pnpm --dir frontend test:unit -- 'src/app/(main)/courses/_utils/public-course-search-params.test.ts'`

  Expected: 함수가 없어 FAIL.

- [ ] **Step 3: 화면 Storybook 실패 상태 작성**

  정상·로딩·빈 결과·첫 요청 오류·다음 페이지 로딩을 만든다. play 테스트는 지역 칩과 최신순·인기순 변경이 router의 URL을 바꾸고, 쿼리 키가 바뀐 뒤 이전 페이지 카드가 남지 않으며, 스크롤 감지 중 중복 `fetchNextPage`가 발생하지 않는다고 단언한다.

- [ ] **Step 4: 페이지와 화면 구현**

  ```ts
  export function parsePublicCourseSearchParams(input: Record<string, string | string[] | undefined>): Omit<GetPublicCoursesQuery, "cursor" | "limit">;
  export function PublicCoursesScreen({ initialQuery }: Readonly<{ initialQuery: PublicCourseBrowseQuery }>): ReactElement;
  ```

  `page.tsx`는 `searchParams: Promise<...>`를 await하고 검증된 값을 화면에 전달한다. 화면은 전체와 공용 지역 상수로 만든 가로 칩, 접근 가능한 네이티브 최신순·인기순 select, 공개 카드 목록과 무한 스크롤 감지 지점을 렌더링한다. 필터 변경은 cursor 없이 URL을 `replace`하고 목록 상단으로 복귀한다.

- [ ] **Step 5: 화면 검증**

  Run: `pnpm --dir frontend test:unit -- 'src/app/(main)/courses/_utils/public-course-search-params.test.ts' && pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/courses/_components/PublicCoursesScreen.stories.tsx'`

  Expected: PASS at 320px, 390px, 480px; 키보드로 칩·select·코스 링크 사용 가능.

- [ ] **Step 6: 커밋**

  ```bash
  git add 'frontend/src/app/(main)/courses/page.tsx' 'frontend/src/app/(main)/courses/_components/PublicCoursesScreen.tsx' 'frontend/src/app/(main)/courses/_components/PublicCoursesScreen.stories.tsx' 'frontend/src/app/(main)/courses/_utils'
  git commit -m "feat: 공개 산책 코스 탐색 화면 추가"
  ```

### Task 10: 문서·전체 검증·운영 확인

**Files:**
- Modify: `docs/course-page-feature.md`
- Modify: `docs/superpowers/specs/2026-11-11-public-course-discovery-design.md` only if implementation revealed a factual mismatch

**Interfaces:**
- Consumes: Tasks 1–9의 완성된 기능
- Produces: 구현 상태 문서와 배포 전 백필 절차

- [ ] **Step 1: 기능 문서 갱신**

  공개 코스 탐색, 최신순·인기순, 지역 필터, 홈 일일 추천, Pick 표시가 구현됐다고 기록한다. Pick 운영자 관리 기능과 감사 기록은 남은 범위로 유지한다. `MEMORY.md`는 패키지 경계와 핵심 기술이 바뀌지 않았으므로 수정하지 않는다.

- [ ] **Step 2: 전체 자동 검증**

  Run:

  ```bash
  pnpm --dir packages build
  pnpm --dir backend test
  pnpm --dir backend build
  pnpm --dir frontend test:unit
  pnpm --dir frontend exec vitest --project storybook --run
  pnpm --dir frontend lint
  pnpm --dir frontend build
  git diff --check
  ```

  Expected: 전부 PASS.

- [ ] **Step 3: 브라우저 수동 확인**

  320px, 390px, 480px에서 홈과 `/courses`를 확인한다. 지역·정렬 URL 복원, 상세 뒤로가기, 무한 스크롤, 키보드 포커스, 긴 텍스트, 깨진 이미지, 로딩·빈 상태·오류 상태를 확인한다.

- [ ] **Step 4: 백필 dry-run과 적용 절차 기록**

  인기순 API가 운영 요청을 받기 전에 운영 DB에서 `pnpm --dir backend backfill:course-like-counts`로 대상 수를 확인하고, 승인된 배포 절차에서만 `--apply`를 사용한다고 PR에 적는다. 로컬에 `MONGODB_URI`가 없으면 실행하지 않고 그 이유를 검증 결과에 남긴다.

- [ ] **Step 5: 최종 문서 커밋**

  ```bash
  git add docs/course-page-feature.md docs/superpowers/specs/2026-11-11-public-course-discovery-design.md
  git commit -m "docs: 공개 코스 탐색 구현 상태 반영"
  ```
