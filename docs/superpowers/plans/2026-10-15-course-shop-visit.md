# Course Shop Visit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 같은 날 같은 상점의 방문 로그 중복을 막고, 코스별 상점 방문 상태와 선택형 방문 로그 작성 흐름을 제공한다.

**Architecture:** `VisitLog`에는 한국 날짜 키와 부분 고유 인덱스를 추가해 중복을 최종 보장한다. 코스 진행 상태는 별도 `CourseShopVisit` 문서로 저장하고, 코스 상세 응답·React Query 캐시·BottomSheet UI를 한 흐름으로 연결한다.

**Tech Stack:** TypeScript 6, Express, Mongoose, Zod, Vitest, Next.js 16 App Router, React 19, TanStack Query

**Spec:** `docs/superpowers/specs/2026-10-15-course-shop-visit-design.md`

## Global Constraints

- 동일 사용자·상점·한국 날짜의 활성 방문 로그는 1개만 허용하고 중복은 `409 VISIT_LOG_ALREADY_EXISTS`로 반환한다.
- 삭제된 방문 로그는 중복 판단에서 제외한다.
- 방문 체크와 방문 로그는 서로 자동 생성·수정·삭제하지 않는다.
- 코스 방문 저장·해제 API는 멱등이어야 하며 접근 가능한 코스에 포함된 상점만 허용한다.
- `로그 작성하기`는 방문 저장 성공 뒤에만 이동하고, 코스에서 진입한 작성 완료 후 원래 코스로 돌아간다.
- BottomSheet 바깥 영역이나 뒤로가기로 닫으면 방문 상태를 저장하지 않는다.
- 실제 데이터 백필은 읽기 전용 검사에서 중복이 없음을 확인한 뒤 별도 승인 없이 실행하지 않는다.
- `packages/shared/src/tag/tag.constants.ts`의 사용자 줄바꿈 변경은 첫 구현 커밋에 포함하되 태그 값은 바꾸지 않는다.

## Review Focus

- UTC 자정 전후가 같은 한국 날짜라면 중복으로 막히고 다른 한국 날짜라면 허용되어야 한다(Task 1).
- 사전 중복 조회를 동시에 통과한 요청도 MongoDB `E11000`을 동일한 409 오류로 바꿔야 한다(Task 1).
- 비공개 타인 코스나 코스에 없는 상점은 방문 상태를 바꿀 수 없어야 한다(Task 2).
- 방문 체크 저장 실패 시 로그 작성 화면으로 이동하지 않고 이전 버튼 상태가 유지되어야 한다(Task 4).
- 같은 날짜 중복 오류 뒤에도 날짜·태그·내용 입력이 보존되어야 한다(Task 5).

---

### Task 1: 방문 로그 한국 날짜 중복 차단

**Files:**
- Create: `backend/src/utils/korea-date.ts`
- Create: `backend/src/utils/korea-date.test.ts`
- Create: `backend/src/scripts/backfill-visit-log-dates.ts`
- Create: `backend/src/scripts/backfill-visit-log-dates.test.ts`
- Modify: `backend/src/models/visit-log.model.ts`
- Modify: `backend/src/models/visit-log.model.test.ts`
- Modify: `backend/src/services/visit-log/visit-log.create.service.ts`
- Modify: `backend/src/services/visit-log/visit-log.create.service.test.ts`
- Modify: `packages/shared/src/tag/tag.constants.ts`

**Interfaces:**
- Produces: `toKoreaDateKey(date: Date): string`, 저장 필드 `visitedDate: YYYY-MM-DD`, 오류 코드 `VISIT_LOG_ALREADY_EXISTS`.
- Produces: 백필 스크립트의 기본 dry-run과 명시적 apply 모드. 활성 중복 발견 시 ID를 출력하고 쓰기·인덱스 생성을 중단한다.

- [ ] **Step 1: 한국 날짜 경계와 모델 인덱스 실패 테스트 작성**
  - `2026-10-14T14:59:59.999Z → 2026-10-14`, `2026-10-14T15:00:00.000Z → 2026-10-15`를 단정한다.
  - 활성 상태에만 `{ userId, shopId, visitedDate }` 고유 인덱스가 적용됨을 단정한다.
- [ ] **Step 2: 서비스 중복 테스트 작성**
  - 사전 조회 중복, `E11000` 경쟁 충돌은 모두 409 코드로 변환한다.
  - 다른 날짜와 삭제된 로그의 날짜는 허용한다.
- [ ] **Step 3: 집중 테스트를 실행해 새 단정이 실패함을 확인**
  - Run: `pnpm --dir backend exec vitest run src/utils/korea-date.test.ts src/models/visit-log.model.test.ts src/services/visit-log/visit-log.create.service.test.ts`
  - Expected: 새 함수·필드·중복 처리 부재로 FAIL.
- [ ] **Step 4: 최소 구현과 안전한 백필 검사 추가**
  - 서비스는 `VisitLogModel.exists({ userId, shopId, visitedDate, status: "active" })`를 먼저 확인하고 생성 경쟁 충돌도 같은 API 오류로 변환한다.
  - dry-run은 누락 필드 수와 활성 중복 그룹을 출력하며 데이터를 바꾸지 않는다.
- [ ] **Step 5: 집중 테스트와 공용 패키지 빌드 실행**
  - Run: `pnpm --dir backend exec vitest run src/utils/korea-date.test.ts src/models/visit-log.model.test.ts src/services/visit-log/visit-log.create.service.test.ts src/scripts/backfill-visit-log-dates.test.ts && pnpm --dir packages build`
  - Expected: PASS.
- [ ] **Step 6: 구현 커밋**
  - Commit: `feat: 방문 로그 날짜 중복을 차단한다`

### Task 2: 코스 상점 방문 상태 API

**Files:**
- Create: `backend/src/models/course-shop-visit.model.ts`
- Create: `backend/src/models/course-shop-visit.model.test.ts`
- Create: `backend/src/services/course/course-shop-visit.service.ts`
- Create: `backend/src/services/course/course-shop-visit.service.test.ts`
- Modify: `backend/src/validations/course.validation.ts`
- Modify: `backend/src/controllers/course.controller.ts`
- Modify: `backend/src/routes/course.routes.ts`
- Modify: `backend/src/routes/course.routes.test.ts`
- Modify: `packages/shared/src/course/course.api.types.ts`

**Interfaces:**
- Produces: `setCourseShopVisited(userId, courseId, shopId)`와 `unsetCourseShopVisited(...)`, 응답 `{ isVisited: boolean }`.
- Produces: `PUT/DELETE /courses/:courseId/shops/:shopId/visit`.

- [ ] **Step 1: 모델·서비스·라우트 실패 테스트 작성**
  - 삼중 고유 인덱스, 저장/해제 멱등성, 비공개 권한, 코스 미포함 상점, 인증을 단정한다.
- [ ] **Step 2: 집중 테스트를 실행해 실패 확인**
  - Run: `pnpm --dir backend exec vitest run src/models/course-shop-visit.model.test.ts src/services/course/course-shop-visit.service.test.ts src/routes/course.routes.test.ts`
  - Expected: 새 모델·서비스·경로 부재로 FAIL.
- [ ] **Step 3: 모델부터 라우터까지 최소 구현**
  - 저장은 `updateOne(..., { $setOnInsert }, { upsert: true })`, 해제는 `deleteOne`을 사용한다.
  - 기존 코스 가시성 규칙을 재사용한 뒤 `course.shops` 포함 여부를 확인한다.
- [ ] **Step 4: 집중 테스트와 백엔드 빌드 실행**
  - Run: `pnpm --dir backend exec vitest run src/models/course-shop-visit.model.test.ts src/services/course/course-shop-visit.service.test.ts src/routes/course.routes.test.ts && pnpm --dir backend build`
  - Expected: PASS.
- [ ] **Step 5: 구현 커밋**
  - Commit: `feat: 코스 상점 방문 상태 API를 추가한다`

### Task 3: 코스 상세 방문 상태와 삭제 정리

**Files:**
- Modify: `packages/shared/src/course/course.types.ts`
- Modify: `backend/src/services/course/course.read.service.ts`
- Modify: `backend/src/services/course/course-detail.mapper.test.ts`
- Modify: `backend/src/services/course/course.delete.service.ts`
- Modify: `backend/src/services/course/course.delete.service.test.ts`

**Interfaces:**
- Consumes: Task 2의 `CourseShopVisitModel`.
- Produces: 각 `CourseDetailShop`의 `isVisited: boolean`과 코스 삭제 시 방문 문서 정리.

- [ ] **Step 1: 일괄 조회와 삭제 정리 실패 테스트 작성**
  - 코스 상세가 한 번의 방문 문서 조회로 각 상점 상태를 매핑하고, 코스 삭제가 관련 방문 문서를 삭제함을 단정한다.
- [ ] **Step 2: 집중 테스트 실패 확인**
  - Run: `pnpm --dir backend exec vitest run src/services/course/course-detail.mapper.test.ts src/services/course/course.delete.service.test.ts`
  - Expected: `isVisited`와 정리 호출 부재로 FAIL.
- [ ] **Step 3: 상세 조회와 삭제 서비스 구현**
  - `CourseShopVisitModel.find({ userId, courseId, shopId: { $in: shopIds } })` 결과를 Set으로 바꿔 N+1 조회를 피한다.
- [ ] **Step 4: 집중 테스트와 공용·백엔드 빌드 실행**
  - Run: `pnpm --dir backend exec vitest run src/services/course/course-detail.mapper.test.ts src/services/course/course.delete.service.test.ts && pnpm --dir packages build && pnpm --dir backend build`
  - Expected: PASS.
- [ ] **Step 5: 구현 커밋**
  - Commit: `feat: 코스 상세에 방문 상태를 제공한다`

### Task 4: 코스 방문 버튼과 제안 BottomSheet

**Files:**
- Create: `frontend/src/app/(main)/courses/[courseId]/_components/CourseShopVisitSheet.tsx`
- Create: `frontend/src/app/(main)/courses/[courseId]/_components/CourseShopVisitButton.tsx`
- Create: `frontend/src/app/(main)/courses/[courseId]/_components/CourseShopVisitButton.stories.tsx`
- Modify: `frontend/src/api/course/course.api.ts`
- Modify: `frontend/src/api/course/course.query.ts`
- Modify: `frontend/src/api/course/course.query.test.ts`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailShopItem.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.tsx`

**Interfaces:**
- Consumes: Task 2의 방문 API와 Task 3의 `shop.isVisited`.
- Produces: 낙관적 캐시 갱신 훅과 `onWriteLog(shopId)` 콜백.

- [ ] **Step 1: API·캐시·Storybook 상호작용 실패 테스트 작성**
  - 미방문 클릭은 시트만 열고, 닫기는 저장하지 않으며, 두 선택은 저장한다.
  - 활성 클릭은 즉시 해제하며 실패 시 이전 상태와 오류 문구를 유지한다.
- [ ] **Step 2: 테스트 실패 확인**
  - Run: `pnpm --dir frontend exec vitest run src/api/course/course.query.test.ts && pnpm --dir frontend exec vitest --project storybook --run`
  - Expected: API와 UI 부재로 FAIL.
- [ ] **Step 3: API 훅·버튼·BottomSheet 구현**
  - `aria-pressed`, 요청 중 해당 버튼 비활성화, 이벤트 영역 분리, Snackbar 오류를 포함한다.
- [ ] **Step 4: 집중 테스트 실행**
  - Run: `pnpm --dir frontend exec vitest run src/api/course/course.query.test.ts && pnpm --dir frontend exec vitest --project storybook --run`
  - Expected: PASS.
- [ ] **Step 5: 구현 커밋**
  - Commit: `feat: 코스 상점 방문 체크 흐름을 추가한다`

### Task 5: 코스 출발 방문 로그 복귀와 중복 안내

**Files:**
- Modify: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/_components/VisitLogCreateScreen.tsx`
- Modify: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/_components/visit-log-navigation.test.ts`
- Modify: `frontend/src/api/client.ts`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.tsx`

**Interfaces:**
- Consumes: Task 4의 `onWriteLog(shopId)`.
- Produces: 신뢰 가능한 `returnTo=/courses/:courseId` 처리와 `VISIT_LOG_ALREADY_EXISTS` 전용 안내.

- [ ] **Step 1: 복귀 경로·중복 입력 보존 실패 테스트 작성**
  - 내부 코스 상세 경로만 허용하고 외부 URL·다른 경로는 거부한다.
  - 409 중복은 정확한 안내를 표시하며 폼 상태와 3단계를 유지한다.
- [ ] **Step 2: 테스트 실패 확인**
  - Run: `pnpm --dir frontend exec vitest run src/app/'(main)'/shops/'[shopId]'/visit-logs/new/_components/visit-log-navigation.test.ts`
  - Expected: 코스 복귀와 오류 분기 부재로 FAIL.
- [ ] **Step 3: 이동·복귀·오류 처리 구현**
  - 코스 버튼은 인코딩된 `returnTo`를 붙이고, 성공 후 검증된 경로로 `replace`한다.
- [ ] **Step 4: 집중 테스트 실행**
  - Run: `pnpm --dir frontend exec vitest run src/app/'(main)'/shops/'[shopId]'/visit-logs/new/_components/visit-log-navigation.test.ts`
  - Expected: PASS.
- [ ] **Step 5: 구현 커밋**
  - Commit: `feat: 코스 방문 로그 작성 복귀를 연결한다`

### Task 6: 상점 상세 CTA와 전체 검증

**Files:**
- Modify: `frontend/src/app/(main)/shops/[shopId]/_components/ShopDetailActions.tsx`
- Modify: `frontend/src/app/(main)/shops/[shopId]/_components/ShopDetail.stories.tsx`

**Interfaces:**
- Produces: 상점 상세에서 `방문했어요`로 바로 방문 로그 작성 화면에 진입하는 CTA.

- [ ] **Step 1: Storybook 상호작용 단정 갱신 후 CTA 문구 변경**
- [ ] **Step 2: 전체 검증 실행**
  - Run: `pnpm --dir packages build`
  - Run: `pnpm --dir backend test && pnpm --dir backend build`
  - Run: `pnpm --dir frontend test:unit && pnpm --dir frontend exec vitest --project storybook --run`
  - Run: `pnpm --dir frontend lint && pnpm --dir frontend build`
  - Run: `git diff --check`
  - Expected: 모두 성공.
- [ ] **Step 3: 320px·390px·480px와 키보드·포커스 수동 검증**
  - 버튼/시트가 화면 안에 들어오고, 포커스 이동과 `aria-pressed`가 상태를 전달함을 확인한다.
- [ ] **Step 4: 마무리 커밋**
  - Commit: `feat: 방문 로그 진입 문구를 정리한다`

## Checkpoints

- Task 1 후: DB 중복 정책과 dry-run이 독립적으로 검증됨.
- Task 3 후: 백엔드 API와 코스 상세 상태가 새로고침 뒤에도 유지됨.
- Task 5 후: 코스 방문 체크에서 로그 작성·복귀까지 연결됨.
- Task 6 후: 전체 테스트·빌드·린트와 모바일 접근성 검증 완료.

## Migration Runbook

1. 백필 스크립트를 기본 dry-run으로 실행해 누락 수와 활성 중복 ID만 확인한다.
2. 중복이 하나라도 있으면 apply를 실행하지 않고 사용자에게 정리 선택을 요청한다.
3. 중복이 없더라도 실제 DB 쓰기 apply는 별도 승인 뒤 실행한다.
4. apply 뒤 인덱스 목록과 표본 문서의 `visitedDate`를 읽기 전용으로 확인한다.
