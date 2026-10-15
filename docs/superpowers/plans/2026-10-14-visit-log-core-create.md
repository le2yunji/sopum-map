# Visit Log Core Create Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 사용자가 실제 상점 정보와 공용 태그를 사용해 이미지 없이 공개 방문 로그를 작성하는 흐름을 끝까지 연결한다.

**Architecture:** `@sopum-map/shared`가 작성 요청·응답과 `TagKey` 계약을 소유한다. 백엔드는 Zod 경계 검증 뒤 상점과 활성 태그를 확인하고 `VisitLog` 단일 문서를 생성한다. 프론트엔드는 React Query mutation과 전용 태그 선택 컴포넌트를 조합해 작성 성공 후 상점 상세로 교체 이동한다.

**Tech Stack:** TypeScript 6, Next.js 16 App Router, React 19, TanStack Query 5, Express, Zod, Mongoose 9, MongoDB, Vitest, Storybook

**Spec:** `docs/superpowers/specs/2026-10-14-visit-log-design.md`

## 후속 요구사항 반영

초기 계획 실행 뒤 제품 설계가 다음처럼 확정되었다. 아래 작업 설명과 검증 기준은 이 정책을 기준으로 읽는다.

- 작성 화면은 방문 상점·방문일 → 태그 → 사진·방문 내용의 3단계다.
- 상점이 정해지지 않은 진입점에서는 상점을 검색하고, 상점 상세 등에서 진입하면 해당 상점을 미리 선택한다.
- 태그는 24개 공용 정의의 단일 `label`을 사용하며 전체에서 1~8개를 선택한다.
- 선택 태그를 별도 영역에 복제하지 않고 원래 칩의 활성 색상으로만 표시한다.
- 방문 내용은 선택 사항이며 최대 1,000자다.

## Global Constraints

- 사용자 화면에서는 `후기`가 아니라 `방문 로그`를 사용한다.
- 방문일과 활성 태그 1~8개는 필수이며 사진과 글은 선택 사항이다.
- 작성 화면과 조회 화면은 모두 `TAG_DEFINITIONS.label`을 사용한다.
- 태그 선택은 지도 필터처럼 그룹 제목, 둥근 칩, 활성 색상을 사용한다.
- `product`, `mood`, `experience`를 질문형 그룹으로 표시하고 각 그룹에 더보기·접기를 제공한다.
- 모든 방문 로그는 공개이며 같은 사용자와 상점의 재방문 기록을 허용한다.
- 이번 계획에서는 S3 업로드를 구현하지 않고 `imageKeys`는 빈 배열만 허용한다.
- 새 작성 경로는 `/shops/:shopId/visit-logs/new`이며 기존 `/reviews/new`는 교체 이동한다.
- 새 함수 바로 위에는 목적이나 중요한 이유를 설명하는 짧은 주석을 작성한다.

## Review Focus

- 로컬 날짜를 ISO 문자열로 바꿀 때 날짜가 하루 전후로 바뀌지 않아야 한다. Task 7의 날짜 변환 테스트로 고정한다.
- 접힌 그룹에서 고른 태그가 접은 뒤 사라지거나 제출에서 누락되지 않아야 한다. Task 6의 상호작용 테스트로 고정한다.
- 빠른 연속 클릭이 방문 로그를 중복 생성하지 않아야 한다. Task 7의 pending 상태 테스트로 고정한다.
- inactive 또는 정의되지 않은 태그가 API 경계를 통과해 저장되지 않아야 한다. Task 2와 Task 3의 실패 테스트로 고정한다.
- 직접 작성 URL로 들어온 사용자의 뒤로가기가 앱 밖이나 빈 화면으로 빠지지 않아야 한다. Task 7의 라우팅 테스트로 고정한다.

---

### Task 1: 공용 방문 로그 작성 계약과 태그 그룹 라벨

**Files:**
- Modify: `packages/shared/src/tag/tag.constants.ts`
- Modify: `packages/shared/src/tag/tag.types.ts`
- Modify: `packages/shared/src/visit-log/visit-log.api.types.ts`

**Interfaces:**
- Consumes: 기존 `TagKey`, `TAG_KEYS`, `TAG_GROUPS`, `VisitLogListItem`
- Produces: `TAG_GROUP_LABELS`, `CreateVisitLogRequest`, `CreateVisitLogData`, `CreateVisitLogResponse`, `VisitLogStatus`, 목록 항목의 `selectedTagKeys`

- [x] **Step 1: 공용 계약 구현**

`CreateVisitLogRequest`는 `visitedAt: string`, `selectedTagKeys: readonly TagKey[]`, `content?: string | null`, `imageKeys?: readonly string[]`로 정의한다. `CreateVisitLogData`는 `visitLogId: string`, `CreateVisitLogResponse`는 공통 성공 응답을 사용한다. 상태는 `"active" | "deleted"`로 제한한다.

- [x] **Step 2: 공용 패키지 검증**

Run: `pnpm --dir packages build`

Expected: TypeScript 빌드 PASS. 공용 패키지에는 테스트 러너가 없으므로 계약의 실행 검증은 Task 2와 Task 5의 양쪽 소비자 테스트가 담당한다.

- [x] **Step 3: 커밋**

```bash
git add packages/shared/src/tag packages/shared/src/visit-log
git commit -m "feat: 방문 로그 작성 공용 계약 추가"
```

### Task 2: VisitLog 모델과 작성 요청 검증

**Files:**
- Modify: `backend/src/models/visit-log.model.ts`
- Modify: `backend/src/validations/visit-log.validation.ts`
- Modify: `backend/src/validations/visit-log.validation.test.ts`
- Test: `backend/src/models/visit-log.model.test.ts`

**Interfaces:**
- Consumes: Task 1의 `TAG_KEYS`, `TagKey`, `VisitLogStatus`, `CreateVisitLogRequest`
- Produces: `createVisitLogSchema`, 저장 필드 `selectedTagKeys`, `imageKeys`, `status`

- [x] **Step 1: 실패하는 요청 검증 테스트 작성**

정상 요청, 태그 0개·9개·중복·정의되지 않은 키, 1,000자 초과 글, 비어 있지 않은 `imageKeys`, 미래 방문일을 각각 검증한다. 날짜는 유효한 ISO datetime이어야 한다.

- [x] **Step 2: 검증 테스트 실패 확인**

Run: `pnpm --dir backend exec vitest run src/validations/visit-log.validation.test.ts`

Expected: `createVisitLogSchema`가 없어 FAIL.

- [x] **Step 3: `createVisitLogSchema` 구현**

params의 `shopId`, body의 ISO datetime, 태그 1~8개와 중복, nullable 1,000자 content, 길이 0인 `imageKeys`를 검증한다. 미래 여부는 요청마다 현재 시각을 사용해 검사한다.

- [x] **Step 4: 실패하는 모델 테스트 작성**

기본 status가 active인지, 태그·imageKeys 기본값, 태그 중복과 개수, content 1,000자 경계, 새 조회 인덱스 정의를 검사한다.

- [x] **Step 5: 모델 구현**

기존 `imageUrls` 읽기 호환을 유지하면서 `selectedTagKeys`, `imageKeys`, `status`를 추가한다. content 최대 길이는 작성 UI와 같은 1,000자로 맞춘다. 공개 조회와 내 조회용 복합 인덱스를 추가한다.

- [x] **Step 6: 모델·검증 확인**

Run: `pnpm --dir backend exec vitest run src/validations/visit-log.validation.test.ts src/models/visit-log.model.test.ts`

Expected: PASS.

- [x] **Step 7: 커밋**

```bash
git add backend/src/models/visit-log.model.ts backend/src/models/visit-log.model.test.ts backend/src/validations/visit-log.validation.ts backend/src/validations/visit-log.validation.test.ts
git commit -m "feat: 방문 로그 생성 데이터 검증 추가"
```

### Task 3: 이미지 없는 방문 로그 생성 서비스

**Files:**
- Create: `backend/src/services/visit-log/visit-log.create.service.ts`
- Create: `backend/src/services/visit-log/visit-log.create.service.test.ts`
- Modify: `backend/src/services/visit-log/visit-log.service.types.ts`

**Interfaces:**
- Consumes: `createVisitLog(userId: string, shopId: string, input: CreateVisitLogRequest)` 입력, `ACTIVE_TAG_DEFINITIONS`
- Produces: `Promise<CreateVisitLogData>`와 오류 코드 `SHOP_NOT_FOUND`, `INVALID_VISIT_LOG_TAG`, `VISIT_LOG_IMAGE_NOT_SUPPORTED`

- [x] **Step 1: 생성 서비스 실패 테스트 작성**

활성 상점과 활성 태그로 생성, 같은 상점 재방문 허용, 없는·hidden·closed 상점, inactive 태그, 비어 있지 않은 imageKeys를 검사한다. 저장 시 `userId`, `shopId`, `selectedTagKeys`, trim된 content, active status가 들어가는지 확인한다.

- [x] **Step 2: 서비스 테스트 실패 확인**

Run: `pnpm --dir backend exec vitest run src/services/visit-log/visit-log.create.service.test.ts`

Expected: 생성 서비스가 없어 FAIL.

- [x] **Step 3: `createVisitLog` 구현**

`ShopModel.exists({_id: shopId, status: "active"})`로 상점을 확인한다. 모든 태그가 `ACTIVE_TAG_DEFINITIONS`에 있는지 Set으로 검사하고 `VisitLogModel.create`를 한 번 호출한다. 빈 content는 null로 정규화한다. 이 초기 단계에서는 재방문 중복 조회나 unique index를 추가하지 않았다. 동일 날짜 중복 정책은 후속 `2026-10-15-course-shop-visit-design.md`가 대체한다.

- [x] **Step 4: 서비스 테스트 확인**

Run: `pnpm --dir backend exec vitest run src/services/visit-log/visit-log.create.service.test.ts`

Expected: PASS.

- [x] **Step 5: 커밋**

```bash
git add backend/src/services/visit-log
git commit -m "feat: 이미지 없는 방문 로그 생성 서비스 구현"
```

### Task 4: 방문 로그 생성 HTTP 엔드포인트

**Files:**
- Modify: `backend/src/controllers/visit-log.controller.ts`
- Modify: `backend/src/routes/shop.routes.ts`
- Test: `backend/src/controllers/visit-log.controller.test.ts`

**Interfaces:**
- Consumes: Task 2의 `createVisitLogSchema`, Task 3의 `createVisitLog`
- Produces: 인증이 필요한 `POST /api/shops/:shopId/visit-logs`, HTTP 201 `CreateVisitLogResponse`

- [x] **Step 1: 컨트롤러 실패 테스트 작성**

검증된 params/body와 `req.auth.userId`를 서비스에 전달하고 201 성공 응답을 반환하는지 검사한다. 서비스 실패는 `next`로 전달되는지 검사한다.

- [x] **Step 2: 컨트롤러 테스트 실패 확인**

Run: `pnpm --dir backend exec vitest run src/controllers/visit-log.controller.test.ts`

Expected: 생성 컨트롤러가 없어 FAIL.

- [x] **Step 3: 컨트롤러와 라우트 구현**

GET 라우트보다 구체적인 동일 경로 POST에 `requireAuth`, `validateRequest(createVisitLogSchema)`, 생성 컨트롤러를 연결한다.

- [x] **Step 4: 백엔드 방문 로그 검증**

Run: `pnpm --dir backend exec vitest run src/validations/visit-log.validation.test.ts src/models/visit-log.model.test.ts src/services/visit-log/visit-log.create.service.test.ts src/controllers/visit-log.controller.test.ts && pnpm --dir backend build`

Expected: 테스트와 빌드 PASS.

- [x] **Step 5: 커밋**

```bash
git add backend/src/controllers/visit-log.controller.ts backend/src/controllers/visit-log.controller.test.ts backend/src/routes/shop.routes.ts
git commit -m "feat: 방문 로그 생성 API 연결"
```

### Task 5: 프론트엔드 방문 로그 작성 API와 mutation

**Files:**
- Modify: `frontend/src/api/visit-log/visit-log.api.ts`
- Modify: `frontend/src/api/visit-log/visit-log.api.test.ts`
- Create: `frontend/src/api/visit-log/visit-log.query.ts`
- Create: `frontend/src/api/visit-log/visit-log.query.test.ts`

**Interfaces:**
- Consumes: `CreateVisitLogRequest`, `CreateVisitLogData`
- Produces: `createVisitLog(shopId, input)`, `useCreateVisitLog(shopId)`

- [x] **Step 1: API와 mutation 실패 테스트 작성**

POST 주소, body 전달, mutation 함수의 shopId 고정과 입력 전달을 검사한다.

- [x] **Step 2: 프론트 단위 테스트 실패 확인**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/api/visit-log/visit-log.api.test.ts src/api/visit-log/visit-log.query.test.ts`

Expected: 작성 함수와 훅이 없어 FAIL.

- [x] **Step 3: 작성 API와 mutation 구현**

기존 `apiClient`와 TanStack Query 패턴을 사용한다. 성공 시 `shopQueryKeys.detail(shopId)`를 무효화해 방문 로그 수를 갱신한다. 현재 방문 로그 목록은 React Query가 아니라 화면 내부에서 조회하므로 별도 목록 key를 가정하지 않는다.

- [x] **Step 4: 프론트 API 테스트 확인**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/api/visit-log/visit-log.api.test.ts src/api/visit-log/visit-log.query.test.ts`

Expected: PASS.

- [x] **Step 5: 커밋**

```bash
git add frontend/src/api/visit-log
git commit -m "feat: 방문 로그 작성 클라이언트 추가"
```

### Task 6: 질문형 방문 태그 선택 UI

**Files:**
- Create: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/_components/VisitLogTagSelector.tsx`
- Create: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/_components/VisitLogTagSelector.stories.tsx`

**Interfaces:**
- Consumes: `TAG_GROUPS`, `TAG_GROUP_LABELS`, `ACTIVE_TAG_DEFINITIONS`, `TagKey`
- Produces: `VisitLogTagSelector({selectedTagKeys, onChange, errorMessage})`

- [x] **Step 1: Storybook 상호작용 테스트 작성**

세 질문 그룹, `label` 사용, 그룹별 더보기·접기, 최대 8개, 선택 칩 색상, `aria-expanded`·`aria-pressed`, 오류 메시지 연결을 검사한다.

- [x] **Step 2: Storybook 테스트 실패 확인**

Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/shops/[shopId]/visit-logs/new/_components/VisitLogTagSelector.stories.tsx'`

Expected: 컴포넌트가 없어 FAIL.

- [x] **Step 3: 태그 선택 컴포넌트 구현**

공용 `Button`을 사용하고 선택 결과는 별도 영역에 복제하지 않는다. 선택한 칩 자체에 활성 색상을 표시하고 8개 선택 뒤 선택하지 않은 태그만 disabled 처리한다.

- [x] **Step 4: Storybook 테스트 확인**

Run: 이전 Step 2 명령.

Expected: PASS.

- [x] **Step 5: 커밋**

```bash
git add 'frontend/src/app/(main)/shops/[shopId]/visit-logs/new/_components/VisitLogTagSelector.tsx' 'frontend/src/app/(main)/shops/[shopId]/visit-logs/new/_components/VisitLogTagSelector.stories.tsx'
git commit -m "feat: 질문형 방문 로그 태그 선택 UI 추가"
```

### Task 7: 실제 데이터 기반 방문 로그 작성 화면

**Files:**
- Create: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/page.tsx`
- Create: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/loading.tsx`
- Create: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/error.tsx`
- Create: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/_components/VisitLogCreateScreen.tsx`
- Create: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/_components/VisitLogCreateScreen.stories.tsx`
- Create: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/_components/visit-log-date.ts`
- Create: `frontend/src/app/(main)/shops/[shopId]/visit-logs/new/_components/visit-log-date.test.ts`
- Create: `frontend/src/app/(main)/visit-logs/new/page.tsx`
- Create: `frontend/src/app/(main)/visit-logs/new/_components/VisitLogEntryScreen.tsx`
- Modify: `frontend/src/app/(main)/shops/[shopId]/reviews/new/page.tsx`
- Modify: `frontend/src/app/(main)/shops/[shopId]/_components/ShopReviewSection.tsx`
- Modify: `frontend/src/app/(main)/(tabs)/me/_components/MyPageScreen.tsx`

**Interfaces:**
- Consumes: `useShopDetail(shopId)`, `useCreateVisitLog(shopId)`, Task 6의 selector
- Produces: 상점 검색 또는 미리 선택된 상점에서 시작해 방문일, 태그, 글을 단계별로 제출하는 작성 화면과 기존 주소 호환 이동

- [x] **Step 1: 날짜 변환 실패 테스트 작성**

`toVisitLogIsoDate(dateValue: string): string`이 `YYYY-MM-DD`를 로컬 정오 ISO로 변환해 한국 시간 표시에서 같은 날짜를 유지하고 빈 값과 미래 날짜를 거부하는지 검사한다.

- [x] **Step 2: 화면 Storybook 실패 테스트 작성**

큰 대표 이미지를 포함한 상점 카드, 오늘 방문일, 3단계 이동, 태그 미선택 오류, content 제출, pending 중 버튼 disabled·loading, API 오류 시 입력 유지, 성공 시 상세 replace를 검사한다. 직접 진입 fallback 뒤로가기도 검사한다.

- [x] **Step 3: 테스트 실패 확인**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts 'src/app/(main)/shops/[shopId]/visit-logs/new/_components/visit-log-date.test.ts' && pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/shops/[shopId]/visit-logs/new/_components/VisitLogCreateScreen.stories.tsx'`

Expected: 새 유틸과 화면이 없어 FAIL.

- [x] **Step 4: 작성 화면 구현**

기존 `VisitReviewForm`의 사진 미리보기는 S3 단계까지 노출하지 않는다. 상점 query의 loading/error를 처리하고 방문일·태그·content를 3단계에서 수집해 mutation에 전달한다. 등록 성공 시 안내 상태를 거쳐 `router.replace(/shops/:shopId)`를 호출한다.

- [x] **Step 5: 새 경로와 이전 경로 호환 구현**

상점 상세 경로는 `shopId`를 화면에 전달해 상점을 미리 선택한다. `/visit-logs/new`는 상점 검색 뒤 같은 작성 화면으로 연결하고 마이페이지에서 진입할 수 있게 한다. 기존 reviews/new 페이지는 Next.js 16의 서버 `redirect`로 새 주소에 교체 이동한다. 상점 상세 CTA의 링크와 문구를 새 경로·방문 로그 용어로 변경한다.

- [x] **Step 6: 작성 화면 검증**

Run: Step 3의 두 테스트 명령.

Expected: PASS.

- [x] **Step 7: 프론트 전체 검증**

Run: `pnpm --dir frontend test:unit && pnpm --dir frontend lint && pnpm --dir frontend build`

Expected: 모두 PASS.

- [x] **Step 8: 커밋**

```bash
git add 'frontend/src/app/(main)/shops/[shopId]/visit-logs/new' 'frontend/src/app/(main)/shops/[shopId]/reviews/new/page.tsx' 'frontend/src/app/(main)/shops/[shopId]/_components/ShopReviewSection.tsx'
git commit -m "feat: 방문 로그 작성 흐름 연결"
```

### Task 8: 핵심 작성 흐름 최종 검증과 이슈 반영

**Files:**
- Modify: `docs/superpowers/plans/2026-10-14-visit-log-core-create.md`
- External: GitHub issues `#38`, `#40`, `#54`, `#105`

**Interfaces:**
- Consumes: Tasks 1~7 전체 결과
- Produces: 검증 기록과 실제 완료 항목이 반영된 이슈

- [x] **Step 1: 전체 검증**

Run: `pnpm --dir packages build && pnpm --dir backend test && pnpm --dir backend build && pnpm --dir frontend test:unit && pnpm --dir frontend lint && pnpm --dir frontend build && git diff --check`

Expected: 모든 명령 PASS.

- [x] **Step 2: 모바일·접근성 브라우저 검증**

320px, 390px, 480px에서 작성 화면을 확인한다. 키보드로 단계 이동, 태그 선택, 그룹별 더보기·접기, 오류 초점, pending 버튼을 확인한다. 상점 상세 → 작성 → 성공 → 상세 → 뒤로가기 반복이 없는지 확인한다.

- [x] **Step 3: 이슈 체크리스트 갱신**

완료된 이미지 없는 작성 API와 프론트 연동 항목만 체크한다. S3, 내 목록, 수정·삭제, 상점 상세 정보량 우선 정렬은 미완료로 유지한다.

검증 기록(2026-10-14): 공용 패키지 빌드, 백엔드 143개 테스트·빌드,
프론트엔드 65개 단위 테스트·린트·프로덕션 빌드가 통과했다. Chromium 기반
Storybook 테스트에서 320px·390px·480px 화면, 태그 키보드 선택, 접기·펼치기,
필수 오류 포커스와 요청 중 버튼 상태를 확인했다. 완료 범위는 이슈 #38, #40,
#54, #105에 반영했으며 S3와 조회 카드 등 후속 범위는 체크하지 않았다.

- [x] **Step 4: 계획 실행 상태 커밋**

```bash
git add docs/superpowers/plans/2026-10-14-visit-log-core-create.md
git commit -m "docs: 방문 로그 핵심 작성 흐름 검증 기록"
```

## 후속 계획 경계

이 계획이 끝난 뒤 아래 작업은 별도 계획과 PR로 진행한다.

1. 상점 상세 방문 로그 카드, `label`, 정보량 우선 정렬
2. 내 방문 로그 목록, 사진 없는 컴팩트 카드, 수정·삭제
3. S3 presigned URL 업로드, 이미지 키 소유권과 고아 객체 정리
4. 홈 요약과 방문 로그 보상 시스템
