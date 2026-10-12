# Course Sharing, Likes, and Detail UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 공개 코스를 공유하고 좋아요로 저장하며, 작성자·공개 상태·좋아요 수와 새 방문 순서 UI를 코스 상세 및 내 산책 코스 화면에 제공한다.

**Architecture:** `CourseLike`를 코스와 분리된 컬렉션으로 두고 좋아요와 공개 권한을 백엔드에서 판정한다. 공용 계약은 상세·내 코스·찜한 코스의 표시 모델을 구분하며, 프론트엔드는 React Query의 상세 및 무한 목록 캐시를 낙관적으로 동기화한다.

**Tech Stack:** TypeScript 6, Express 5, Mongoose 9, Zod 4, Next.js 16 App Router, React 19, TanStack Query 5, Vitest 4, Storybook 10, Tailwind CSS 4

**Spec:** `docs/superpowers/specs/2026-10-12-course-sharing-likes-detail-ui-design.md`

## Global Constraints

- 기존 작업 트리의 코스 구간 거리·시간 변경을 보존하고 별도 선행 커밋으로 분리한다.
- 새 코스는 `user_created`, 비공개가 기본이다.
- `recommended` 코스는 `by 소품지도`로 표시하고 항상 공개로 취급한다.
- 사용자 관리자 역할이나 공개 코스 탐색·검색 기능은 추가하지 않는다.
- 목록은 기본 20개와 시간·`_id` 기반 불투명 커서를 사용한다.
- 비공개 찜 항목은 제목, 설명, 지역, 사진, 상점, 작성자와 좋아요 수를 노출하지 않는다.
- 공용 `BottomSheet`와 기존 디자인 토큰을 재사용하고 320px, 390px, 480px를 지원한다.
- API 입력은 Zod로 검증하고 예상 가능한 실패는 공통 오류 형식으로 반환한다.

## Review Focus

- 공개 코스를 조회한 직후 비공개로 바뀌는 경쟁 상황에서도 상세은 `COURSE_PRIVATE`로 막히고 낙관적 상태는 복구되어야 한다.
- 같은 좋아요 요청이 동시에 도착해도 고유 인덱스 충돌을 성공으로 정규화해 좋아요가 한 건만 남아야 한다.
- 동일한 `createdAt`을 가진 목록 항목도 `_id` 보조 정렬로 누락이나 중복 없이 다음 커서를 만들어야 한다.
- 탈퇴하거나 찾을 수 없는 작성자의 공개 코스는 상세 조회가 깨지지 않고 `알 수 없는 사용자`로 표시되어야 한다.
- Web Share API와 Clipboard API가 모두 실패해도 화면이 중단되지 않고 사용자에게 실패 안내가 보여야 한다.

---

### Task 1: 기존 도보 구간 변경 체크포인트

**Files:**
- Modify: 현재 작업 트리에 남아 있는 코스 거리·시간 관련 파일
- Test: `backend/src/services/course-route/walking-distance-matrix.service.test.ts`
- Test: `backend/src/services/course/course-walking-metrics.service.test.ts`
- Test: `frontend/src/app/(main)/courses/[courseId]/_components/course-route-display.test.ts`

**Interfaces:**
- Consumes: 현재 작업 트리의 승인된 구간 거리·시간 구현
- Produces: `CourseDetailShop.walkingDistanceFromPreviousMeters`, `CourseDetailShop.walkingDurationFromPreviousSeconds`가 포함된 깨끗한 기준 커밋

- [x] **Step 1: 현재 변경 범위와 공백 오류 확인**

Run: `git status --short && git diff --check`
Expected: 설계 문서 외 변경은 코스 거리·시간 기능에 한정되고 공백 오류가 없다.

- [x] **Step 2: 기존 거리·시간 구현 검증**

Run: `pnpm --dir packages build && pnpm --dir backend test && pnpm --dir backend build && pnpm --dir frontend test:unit && pnpm --dir frontend lint && pnpm --dir frontend exec next build --webpack`
Expected: 빌드와 테스트는 통과하고 린트는 새 오류가 없다.

- [x] **Step 3: 기존 변경만 체크포인트 커밋**

```bash
git add backend packages/shared frontend/src/app/\(main\)/courses docs/course-page-feature.md
git commit -m "feat: 코스 구간별 도보 정보 저장"
```

### Task 2: 공용 코스 공개·좋아요 계약

**Files:**
- Modify: `packages/shared/src/course/course.types.ts`
- Modify: `packages/shared/src/course/course.api.types.ts`
- Modify: `packages/shared/src/course/index.ts`
- Modify: `packages/shared/src/index.ts`
- Modify: `backend/src/validations/course.validation.ts`
- Test: `backend/src/validations/course.validation.test.ts`

**Interfaces:**
- Consumes: 기존 `CourseDetailData`, `CourseListItem`, `ApiSuccessResponse`
- Produces: `CourseAuthor`, `CourseDetailData.author/isOwner/likeCount/isLiked`, `MyCourseListItem`, `LikedCourseListItem`, `CourseCursorPage<T>`, `UpdateCourseVisibilityRequest`

- [x] **Step 1: 공개 여부와 커서 검증 실패 테스트 작성**

`course.validation.test.ts`에 다음을 검증한다.

- `isPublic`이 boolean이 아니면 실패
- `limit` 기본값은 20, 허용 범위는 1~20
- 빈 cursor 또는 512자를 넘는 cursor는 검증 단계에서 실패

- [x] **Step 2: 검증 테스트가 실패하는지 확인**

Run: `pnpm --dir backend exec vitest run src/validations/course.validation.test.ts`
Expected: 새 스키마 또는 export가 없어 FAIL.

- [x] **Step 3: 공용 타입과 Zod 스키마 구현**

공개 인터페이스를 다음 이름으로 정의한다.

```ts
type CourseAuthor = Readonly<{
  id: string | null;
  displayName: string;
  profileImageUrl: string | null;
  isService: boolean;
}>;

type CourseCursorPage<T> = Readonly<{
  items: readonly T[];
  nextCursor: string | null;
  hasNext: boolean;
}>;
```

`LikedCourseListItem`은 `isPrivate: true`인 제한 항목과 `isPrivate: false`인 공개 항목의 판별 유니온으로 만든다.

- [x] **Step 4: 공용 패키지와 검증 테스트 확인**

Run: `pnpm --dir packages build && pnpm --dir backend exec vitest run src/validations/course.validation.test.ts`
Expected: PASS.

- [x] **Step 5: 계약 커밋**

```bash
git add packages/shared/src/course packages/shared/src/index.ts backend/src/validations/course.validation.ts backend/src/validations/course.validation.test.ts
git commit -m "feat: 코스 공개와 좋아요 api 계약 정의"
```

### Task 3: CourseLike 모델과 커서 도구

**Files:**
- Create: `backend/src/models/course-like.model.ts`
- Create: `backend/src/models/course-like.model.test.ts`
- Create: `backend/src/services/course/course-cursor.ts`
- Create: `backend/src/services/course/course-cursor.test.ts`

**Interfaces:**
- Consumes: Mongoose `Types.ObjectId`
- Produces: `CourseLikeModel`, `encodeCourseCursor(input: { createdAt: Date; id: Types.ObjectId }): string`, `decodeCourseCursor(cursor: string): { createdAt: Date; id: Types.ObjectId }`

- [x] **Step 1: 모델과 커서 실패 테스트 작성**

- 동일 `userId + courseId` 고유 인덱스 존재
- `userId + createdAt + _id` 목록 인덱스 존재
- 같은 시각의 서로 다른 ID가 encode/decode 뒤 그대로 복원
- 손상된 커서는 명시적 오류 반환

- [x] **Step 2: 테스트 실패 확인**

Run: `pnpm --dir backend exec vitest run src/models/course-like.model.test.ts src/services/course/course-cursor.test.ts`
Expected: 모듈이 없어 FAIL.

- [x] **Step 3: 모델과 불투명 커서 구현**

커서는 JSON을 base64url로 인코딩하고, 디코딩 시 날짜와 ObjectId를 다시 검증한다. 목록 쿼리는 `(createdAt < cursor.createdAt) OR (createdAt = cursor.createdAt AND _id < cursor.id)`를 사용한다.

- [x] **Step 4: 테스트 통과 확인**

Run: `pnpm --dir backend exec vitest run src/models/course-like.model.test.ts src/services/course/course-cursor.test.ts`
Expected: PASS.

- [x] **Step 5: 모델 커밋**

```bash
git add backend/src/models/course-like.model.ts backend/src/models/course-like.model.test.ts backend/src/services/course/course-cursor.ts backend/src/services/course/course-cursor.test.ts
git commit -m "feat: 코스 좋아요 모델과 목록 커서 추가"
```

### Task 4: 좋아요 및 공개 여부 API

**Files:**
- Create: `backend/src/services/course/course-like.service.ts`
- Create: `backend/src/services/course/course-like.service.test.ts`
- Create: `backend/src/services/course/course-visibility.service.ts`
- Create: `backend/src/services/course/course-visibility.service.test.ts`
- Modify: `backend/src/controllers/course.controller.ts`
- Modify: `backend/src/routes/course.routes.ts`
- Modify: `backend/src/validations/course.validation.ts`

**Interfaces:**
- Consumes: `CourseLikeModel`, `CourseModel`, `UpdateCourseVisibilityRequest`
- Produces: `likeCourse(userId, courseId)`, `unlikeCourse(userId, courseId)`, `updateCourseVisibility(userId, courseId, isPublic)`

- [x] **Step 1: 권한과 멱등성 실패 테스트 작성**

- 타인의 공개 코스와 추천 코스 좋아요 성공
- 본인 코스는 `COURSE_SELF_LIKE_NOT_ALLOWED`
- 비공개 타인 코스는 `COURSE_PRIVATE`
- 중복 키 충돌은 기존 좋아요 성공으로 처리
- 비공개 코스도 기존 좋아요 해제 가능
- 작성자만 사용자 코스 공개 여부 변경 가능
- 추천 코스 공개 여부 변경 불가
- 비공개 전환 뒤 CourseLike 건수 유지

- [x] **Step 2: 서비스 테스트 실패 확인**

Run: `pnpm --dir backend exec vitest run src/services/course/course-like.service.test.ts src/services/course/course-visibility.service.test.ts`
Expected: 서비스가 없어 FAIL.

- [x] **Step 3: 서비스와 라우터 구현**

다음 경로를 연결한다.

- `POST /api/courses/:courseId/likes`
- `DELETE /api/courses/:courseId/likes`
- `PATCH /api/courses/:courseId/visibility`

- [x] **Step 4: 서비스 테스트와 백엔드 빌드 확인**

Run: `pnpm --dir backend exec vitest run src/services/course/course-like.service.test.ts src/services/course/course-visibility.service.test.ts && pnpm --dir backend build`
Expected: PASS.

- [x] **Step 5: API 커밋**

```bash
git add backend/src/services/course backend/src/controllers/course.controller.ts backend/src/routes/course.routes.ts backend/src/validations/course.validation.ts
git commit -m "feat: 코스 좋아요와 공개 상태 api 구현"
```

### Task 5: 상세 조회 작성자·좋아요·비공개 권한

**Files:**
- Modify: `backend/src/services/course/course.read.service.ts`
- Create: `backend/src/services/course/course-detail.mapper.ts`
- Create: `backend/src/services/course/course-detail.mapper.test.ts`
- Modify: `backend/src/services/course/course.delete.service.ts`
- Test: `backend/src/services/course/course.delete.service.test.ts`

**Interfaces:**
- Consumes: `CourseAuthor`, `CourseLikeModel`, `UserModel`
- Produces: 확장된 `getCourseDetail(userId, courseId): Promise<CourseDetailData>`

- [x] **Step 1: 상세 표시 모델과 삭제 실패 테스트 작성**

- 사용자 코스는 닉네임과 프로필, `isOwner`, `likeCount`, `isLiked` 반환
- 추천 코스는 `소품지도`, `isService: true` 반환
- 작성자를 찾을 수 없으면 `알 수 없는 사용자` 반환
- 비공개 타인 코스는 `COURSE_PRIVATE`
- 코스 삭제 시 연결 좋아요 삭제

- [x] **Step 2: 테스트 실패 확인**

Run: `pnpm --dir backend exec vitest run src/services/course/course-detail.mapper.test.ts src/services/course/course.delete.service.test.ts`
Expected: 새 필드와 삭제 처리가 없어 FAIL.

- [x] **Step 3: 상세 조회와 삭제 정리 구현**

작성자, 현재 사용자의 좋아요, 전체 좋아요 수는 코스와 상점 조회 뒤 각각 한 번씩 조회한다. 삭제는 코스 소유권 확인 뒤 `CourseLike.deleteMany({ courseId })`를 함께 실행한다.

- [x] **Step 4: 상세 및 삭제 테스트 확인**

Run: `pnpm --dir backend exec vitest run src/services/course/course-detail.mapper.test.ts src/services/course/course.delete.service.test.ts && pnpm --dir backend build`
Expected: PASS.

- [x] **Step 5: 상세 커밋**

```bash
git add backend/src/services/course
git commit -m "feat: 코스 상세에 작성자와 좋아요 정보 추가"
```

### Task 6: 내 코스·찜한 코스 커서 목록 API

**Files:**
- Modify: `backend/src/services/course/course.read.service.ts`
- Create: `backend/src/services/course/course-list.mapper.ts`
- Create: `backend/src/services/course/course-list.mapper.test.ts`
- Modify: `backend/src/controllers/course.controller.ts`
- Modify: `backend/src/routes/me.routes.ts`
- Modify: `backend/src/validations/course.validation.ts`

**Interfaces:**
- Consumes: `decodeCourseCursor`, `CourseLikeModel`, `MyCourseListItem`, `LikedCourseListItem`
- Produces: `getMyCourses(userId, pagination)`, `getMyLikedCourses(userId, pagination)` returning `CourseCursorPage`

- [x] **Step 1: 목록 보안과 페이지네이션 실패 테스트 작성**

- 21개 조회 시 20개와 `hasNext: true` 반환
- 같은 생성 시각에서도 `_id` 순서로 다음 페이지가 이어짐
- 내 코스 목록에 `isPublic`, `likeCount` 포함
- 공개 찜 항목에 작성자와 좋아요 수 포함
- 비공개 찜 항목은 `id`, `isPrivate: true`, `likedAt` 외 코스 정보를 노출하지 않음
- 코스별 좋아요 수를 항목마다 별도 조회하지 않음

- [x] **Step 2: 목록 테스트 실패 확인**

Run: `pnpm --dir backend exec vitest run src/services/course/course-list.mapper.test.ts`
Expected: 목록 판별 유니온과 매퍼가 없어 FAIL.

- [x] **Step 3: 목록 서비스와 라우트 구현**

- `GET /api/me/courses?cursor=&limit=20`
- `GET /api/me/liked-courses?cursor=&limit=20`

각 쿼리는 `limit + 1`개를 조회해 `hasNext`를 계산하고, 현재 20개 코스의 좋아요 수는 단일 aggregation으로 집계한다.

- [x] **Step 4: 목록 테스트와 백엔드 전체 검증**

Run: `pnpm --dir backend test && pnpm --dir backend build`
Expected: 모든 테스트 PASS.

- [x] **Step 5: 목록 API 커밋**

```bash
git add backend/src/services/course backend/src/controllers/course.controller.ts backend/src/routes/me.routes.ts backend/src/validations/course.validation.ts
git commit -m "feat: 내 코스와 찜한 코스 페이지네이션 구현"
```

### Task 7: 프론트 API와 낙관적 캐시 동기화

**Files:**
- Modify: `frontend/src/api/course/course.api.ts`
- Modify: `frontend/src/api/course/course.query.ts`
- Create: `frontend/src/api/course/course.query.test.ts`

**Interfaces:**
- Consumes: Task 2와 Task 6의 공용 API 계약
- Produces: `useInfiniteMyCourses`, `useInfiniteLikedCourses`, `useLikeCourse`, `useUnlikeCourse`, `useUpdateCourseVisibility`

- [x] **Step 1: 캐시 동기화 실패 테스트 작성**

- 좋아요 시 상세 `isLiked/likeCount` 즉시 증가
- 실패 시 상세와 찜 목록 이전값 복구
- 찜 해제 시 공개·비공개 항목 모두 찜 목록에서 제거
- 공개 상태 변경 시 상세와 내 코스 목록 동시 반영
- 다음 페이지 매개변수로 `nextCursor` 사용

- [x] **Step 2: 프론트 API 테스트 실패 확인**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/api/course/course.query.test.ts`
Expected: 새 훅이 없어 FAIL.

- [x] **Step 3: API 함수와 Query 훅 구현**

상세, `myCourses`, `likedCourses` 키를 분리한다. mutation의 `onMutate`에서 관련 쿼리를 취소하고 스냅샷을 저장하며, `onError`에서 복원하고 `onSettled`에서 재검증한다.

- [x] **Step 4: API 테스트 확인**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/api/course/course.query.test.ts`
Expected: PASS.

- [x] **Step 5: 프론트 데이터 계층 커밋**

```bash
git add frontend/src/api/course
git commit -m "feat: 코스 좋아요와 목록 query 연결"
```

### Task 8: 코스 상세 헤더·액션·방문 순서 UI

**Files:**
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailShopItem.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/DeleteCourseSheet.tsx`
- Create: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailHeader.tsx`
- Create: `frontend/src/app/(main)/courses/[courseId]/_components/CourseMoreSheet.tsx`
- Create: `frontend/src/app/(main)/courses/[courseId]/_components/CourseVisibilitySheet.tsx`
- Create: `frontend/src/app/(main)/courses/[courseId]/_components/CourseShopActionSheet.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx`

**Interfaces:**
- Consumes: Task 7 mutation 훅, 공용 `BottomSheet`, 기존 지도와 길찾기 URL 도구
- Produces: 소유자·타인·추천 코스를 구분하는 상세 화면과 상점 액션 바텀시트

- [x] **Step 1: Storybook 상호작용 실패 테스트 작성**

- 내 코스: 공유, 더보기, 공개 상태, 좋아요 수가 보이고 좋아요 버튼은 없음
- 타인 공개 코스: 공유, 작성자, 좋아요 버튼과 수가 보이고 더보기는 없음
- 추천 코스: `by 소품지도`와 좋아요 버튼 표시
- 더보기에서 수정·삭제 제공
- 공개→비공개는 확인 바텀시트 제공
- 상점 화살표에서 상점 보기·길찾기 제공
- 공유와 클립보드가 모두 실패하면 오류 스낵바 표시

- [x] **Step 2: Storybook 테스트 실패 확인**

Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'`
Expected: 새 헤더와 액션을 찾지 못해 FAIL.

- [x] **Step 3: 상세 화면 컴포넌트 구현**

하단 고정 수정·삭제 영역을 제거한다. 상점 목록은 순서 원형, 연결선, 사진, 상점 정보와 오른쪽 화살표 구조로 바꾸되 현재 데이터에 없는 방문 시각은 추가하지 않는다.

- [x] **Step 4: 상세 Storybook과 단위 테스트 확인**

Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx' && pnpm --dir frontend test:unit`
Expected: PASS.

- [x] **Step 5: 상세 UI 커밋**

```bash
git add frontend/src/app/\(main\)/courses/\[courseId\]
git commit -m "feat: 코스 상세 공유와 방문 순서 ui 개선"
```

### Task 9: 내 코스·찜한 코스 탭과 무한 스크롤

**Files:**
- Modify: `frontend/src/app/(main)/(tabs)/me/courses/_components/MyCoursesScreen.tsx`
- Modify: `frontend/src/app/(main)/(tabs)/me/courses/_components/CourseListCard.tsx`
- Create: `frontend/src/app/(main)/(tabs)/me/courses/_components/LikedCourseListCard.tsx`
- Create: `frontend/src/app/(main)/(tabs)/me/courses/_components/MyCoursesScreen.stories.tsx`

**Interfaces:**
- Consumes: `useInfiniteMyCourses`, `useInfiniteLikedCourses`, `useUnlikeCourse`
- Produces: `내 코스 / 찜한 코스` 탭, 20개 단위 무한 목록, 비공개 찜 카드

- [x] **Step 1: 탭과 목록 실패 Storybook 테스트 작성**

- 탭 선택 상태와 키보드 이동
- 내 코스 공개 상태와 받은 좋아요 수
- 찜한 공개 코스 작성자와 좋아요 수
- 비공개 코스에 민감 정보가 없고 `비공개 코스`만 표시
- 비공개 카드 클릭 시 정확한 스낵바 문구
- 비공개 카드 찜 해제
- 관찰 대상이 보이면 다음 20개 요청

- [x] **Step 2: Storybook 테스트 실패 확인**

Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/(tabs)/me/courses/_components/MyCoursesScreen.stories.tsx'`
Expected: 새 탭과 카드가 없어 FAIL.

- [x] **Step 3: 탭, 카드와 IntersectionObserver 구현**

탭은 `role="tablist"`, 각 버튼은 `role="tab"`과 `aria-selected`를 사용한다. 다음 페이지 트리거는 로딩 중이거나 `hasNextPage`가 false면 observe하지 않는다.

- [x] **Step 4: 320px·390px·480px Storybook 상태 확인**

Storybook viewport에서 세 너비를 확인하고, 키보드로 탭·카드·찜 해제 버튼에 접근한다.

- [x] **Step 5: 목록 Storybook 테스트 확인**

Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/(tabs)/me/courses/_components/MyCoursesScreen.stories.tsx'`
Expected: PASS.

- [x] **Step 6: 목록 UI 커밋**

```bash
git add frontend/src/app/\(main\)/\(tabs\)/me/courses
git commit -m "feat: 내 코스와 찜한 코스 탭 구현"
```

### Task 10: 통합 검증과 문서 정합성

**Files:**
- Modify: `docs/course-page-feature.md`
- Modify: `docs/superpowers/plans/2026-10-12-course-sharing-likes-detail-ui.md`

**Interfaces:**
- Consumes: Tasks 1-9의 완성된 기능
- Produces: 검증 결과와 일치하는 완료 체크리스트 및 최종 브랜치

- [x] **Step 1: 기능 문서 갱신**

공개 범위, 작성자, 좋아요, 찜한 코스, 20개 커서 목록과 상세 UI 정책을 반영한다. 완료된 항목만 체크한다.

- [x] **Step 2: 전체 정적·자동 검증**

Run: `pnpm --dir packages build && pnpm --dir backend test && pnpm --dir backend build && pnpm --dir frontend test:unit && pnpm --dir frontend lint && pnpm --dir frontend exec next build --webpack && pnpm --dir frontend exec vitest --project storybook --run && git diff --check`
Expected: 모든 빌드와 테스트 PASS, 새 린트 오류와 공백 오류 없음.

- [x] **Step 3: 변경 범위와 비밀값 점검**

Run: `git status --short && git diff --stat 0ece525..HEAD`
Expected: 코스 공개·좋아요·상세·목록과 문서 파일만 포함되고 `.env`나 비밀값이 없다.

- [x] **Step 4: 문서 및 검증 커밋**

```bash
git add docs/course-page-feature.md docs/superpowers/plans/2026-10-12-course-sharing-likes-detail-ui.md
git commit -m "docs: 코스 공개와 좋아요 구현 결과 반영"
```
