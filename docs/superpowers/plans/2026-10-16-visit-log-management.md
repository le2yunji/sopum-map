# Visit Log Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 사용자가 내 방문 로그를 최신 방문일순으로 보고, 본인 로그를 수정하거나 소프트 삭제할 수 있게 한다.

**Architecture:** 기존 `VisitLog` 모델과 상점 공개 목록 매퍼를 재사용하되, 내 목록 응답에는 상점 요약을 함께 제공한다. 수정·삭제는 본인 소유권과 `active` 상태를 한 번에 조건으로 걸어 다른 사용자의 로그와 삭제된 로그를 바꾸지 못하게 한다. 프론트엔드는 React Query 캐시를 공용 키로 관리하고 목록, 수정 폼, 삭제 확인 UI를 분리한다.

**Tech Stack:** TypeScript 6, Express, Mongoose, Zod, Next.js 16 App Router, React 19, TanStack Query, Vitest, Storybook

**Spec:** `docs/superpowers/specs/2026-10-14-visit-log-design.md`

## Global Constraints

- 내 목록은 `visitedAt`, `createdAt`, `_id` 내림차순으로 정렬한다.
- 수정 가능한 값은 방문일, 태그 1~8개, 최대 1,000자 내용뿐이며 S3 전에는 이미지 키를 수정하지 않는다.
- 동일 사용자·상점·한국 날짜의 활성 로그는 하나만 허용한다.
- 삭제는 `status: deleted` 소프트 삭제이며 공개 목록, 내 목록과 상점 집계에서 제외한다.
- 모든 쓰기 API는 로그 작성자 본인만 사용할 수 있다.
- 사용자 화면 태그는 `TAG_DEFINITIONS.label`을 사용한다.
- 320px, 390px, 480px 모바일 폭과 키보드 포커스 동작을 유지한다.

## Review Focus

- 삭제된 로그가 공개·내 목록과 상점 개수에서 다시 노출되지 않는지 확인한다.
- 수정한 방문일이 같은 상점의 기존 활성 로그 날짜와 겹치면 409 오류가 나는지 확인한다.
- 다른 사용자의 로그 ID와 존재하지 않는 ID가 소유 정보 없이 같은 404로 처리되는지 확인한다.
- 마지막 페이지의 마지막 항목 삭제 뒤 빈 페이지가 남지 않고 이전 페이지를 다시 조회하는지 확인한다.
- 수정 요청 실패 시 사용자가 입력한 날짜·태그·내용을 유지하는지 확인한다.

---

### Task 1: 공용 방문 로그 관리 계약

**Files:**
- Modify: `packages/shared/src/visit-log/visit-log.api.types.ts`
- Test: `packages/shared/src/visit-log/visit-log.api.types.test-d.ts` 또는 기존 shared 타입 검사

**Interfaces:**
- Produces: `MyVisitLogListItem`, `GetMyVisitLogsQuery`, `MyVisitLogListData`, `UpdateVisitLogRequest`, `UpdateVisitLogData`, `DeleteVisitLogData`

- [ ] 내 목록 항목에 `shop: { id; name; imageUrl; address }`와 기존 방문 로그 필드를 포함하는 타입 계약을 먼저 작성한다.
- [ ] 수정 요청과 수정·삭제 성공 응답 타입을 추가한다.
- [ ] `pnpm --dir packages build`로 세 패키지에서 사용할 계약이 컴파일되는지 확인한다.
- [ ] 공용 계약 변경을 커밋한다.

### Task 2: 내 목록·수정·소프트 삭제 API

**Files:**
- Modify: `backend/src/validations/visit-log.validation.ts`
- Modify: `backend/src/validations/visit-log.validation.test.ts`
- Modify: `backend/src/services/visit-log/visit-log.service.types.ts`
- Create: `backend/src/services/visit-log/visit-log.manage.service.ts`
- Create: `backend/src/services/visit-log/visit-log.manage.service.test.ts`
- Modify: `backend/src/controllers/visit-log.controller.ts`
- Modify: `backend/src/controllers/visit-log.controller.test.ts`
- Modify: `backend/src/routes/me.routes.ts`
- Create: `backend/src/routes/visit-log.routes.ts`
- Modify: `backend/src/app.ts`

**Interfaces:**
- Consumes: Task 1의 공용 요청·응답 타입
- Produces: `GET /api/me/visit-logs`, `PATCH /api/visit-logs/:visitLogId`, `DELETE /api/visit-logs/:visitLogId`

- [ ] 목록 페이지네이션, 수정 입력, 로그 ID 검증의 실패 테스트를 먼저 작성하고 실패를 확인한다.
- [ ] 내 활성 로그만 최신 방문일순으로 조회하고 상점 요약을 한 번에 결합하는 서비스 테스트를 작성하고 실패를 확인한다.
- [ ] 본인 활성 로그만 수정하며 날짜 중복을 409 `VISIT_LOG_ALREADY_EXISTS`로 바꾸는 테스트를 작성하고 실패를 확인한다.
- [ ] 본인 활성 로그만 `deleted`로 바꾸는 테스트를 작성하고 실패를 확인한다.
- [ ] 최소 서비스·컨트롤러·라우터 구현 후 집중 테스트를 통과시킨다.
- [ ] 백엔드 API 변경을 커밋한다.

### Task 3: 삭제된 로그 공개 노출 차단

**Files:**
- Modify: `backend/src/services/visit-log/visit-log.service.ts`
- Modify: `backend/src/services/visit-log/visit-log.service.test.ts`
- Modify: `backend/src/services/shop/shop.service.test.ts`

**Interfaces:**
- Produces: 공개 목록과 상점 `visitLogCount`에서 `status: active`만 집계하는 동작

- [ ] 공개 목록 조회와 개수 집계에서 삭제 로그를 제외하는 실패 테스트를 작성한다.
- [ ] 두 쿼리에 `status: active` 조건을 적용해 테스트를 통과시킨다.
- [ ] 공개 조회 회귀 수정을 커밋한다.

### Task 4: 프론트 API와 내 방문 로그 목록

**Files:**
- Modify: `frontend/src/api/visit-log/visit-log.api.ts`
- Modify: `frontend/src/api/visit-log/visit-log.api.test.ts`
- Modify: `frontend/src/api/visit-log/visit-log.query.ts`
- Modify: `frontend/src/api/visit-log/visit-log.query.test.ts`
- Create: `frontend/src/app/(main)/(tabs)/me/visit-logs/page.tsx`
- Create: `frontend/src/app/(main)/(tabs)/me/visit-logs/loading.tsx`
- Create: `frontend/src/app/(main)/(tabs)/me/visit-logs/error.tsx`
- Create: `frontend/src/app/(main)/(tabs)/me/visit-logs/_components/MyVisitLogsScreen.tsx`
- Create: `frontend/src/app/(main)/(tabs)/me/visit-logs/_components/MyVisitLogCard.tsx`
- Create: `frontend/src/app/(main)/(tabs)/me/visit-logs/_components/MyVisitLogsScreen.stories.tsx`
- Modify: `frontend/src/app/(main)/(tabs)/me/_components/MyPageMenu.tsx`

**Interfaces:**
- Consumes: `GET /api/me/visit-logs`
- Produces: 최신순 목록, 사진 없는 컴팩트 카드, 통계, 새 기록·수정·삭제 진입 UI

- [ ] API URL·페이지네이션·캐시 키 테스트를 먼저 작성하고 실패를 확인한다.
- [ ] 정상·로딩·빈 상태·오류 상태 Storybook 테스트를 먼저 작성하고 실패를 확인한다.
- [ ] 사진 유무에 맞는 카드와 태그 라벨, 상점 링크, 수정·삭제 버튼을 구현한다.
- [ ] 목록 삭제 성공 시 관련 목록·상점 캐시를 무효화하고 마지막 항목 페이지를 보정한다.
- [ ] 마이페이지의 임시 방문 기록 개수를 실제 목록 데이터로 바꾼다.
- [ ] 집중 단위·Storybook 테스트를 통과시키고 커밋한다.

### Task 5: 방문 로그 수정 화면

**Files:**
- Create: `frontend/src/app/(main)/visit-logs/[visitLogId]/edit/page.tsx`
- Create: `frontend/src/app/(main)/visit-logs/[visitLogId]/edit/loading.tsx`
- Create: `frontend/src/app/(main)/visit-logs/[visitLogId]/edit/error.tsx`
- Create: `frontend/src/app/(main)/visit-logs/[visitLogId]/edit/_components/VisitLogEditScreen.tsx`
- Create: `frontend/src/app/(main)/visit-logs/[visitLogId]/edit/_components/VisitLogEditScreen.stories.tsx`
- Modify: `frontend/src/api/visit-log/visit-log.api.ts`
- Modify: `frontend/src/api/visit-log/visit-log.query.ts`

**Interfaces:**
- Consumes: Task 4 목록 항목과 `PATCH /api/visit-logs/:visitLogId`
- Produces: 기존 날짜·태그·내용을 채운 수정 폼과 저장 후 내 목록 복귀 흐름

- [ ] 기존 값 표시, 필수 태그, 미래 날짜, 1,000자, 실패 입력 유지 Storybook 테스트를 먼저 작성한다.
- [ ] 작성 화면의 달력과 태그 선택기를 재사용하되 수정 화면 상태는 독립적으로 관리한다.
- [ ] 성공 시 캐시를 무효화하고 내 방문 로그 목록으로 교체 이동한다.
- [ ] 집중 테스트를 통과시키고 커밋한다.

### Task 6: 전체 검증과 이슈 정리

**Files:**
- Modify: GitHub issues `#38`, `#40`, `#54`

**Interfaces:**
- Produces: 코드와 일치하는 체크리스트 및 완료 근거

- [ ] `pnpm --dir packages build`, `pnpm --dir backend test`, `pnpm --dir backend build`를 실행한다.
- [ ] `pnpm --dir frontend test:unit`, `pnpm --dir frontend exec vitest --project storybook --run`, `pnpm --dir frontend lint`, `pnpm --dir frontend build`를 실행한다.
- [ ] 320px, 390px, 480px에서 목록·수정·삭제 흐름과 키보드 포커스를 확인한다.
- [ ] `git diff --check`와 변경 파일 목록을 확인한다.
- [ ] 실제 통과 항목만 이슈에 체크하고 남은 S3 작업은 미완료로 유지한다.
- [ ] 검증과 이슈 정리를 커밋한다.
