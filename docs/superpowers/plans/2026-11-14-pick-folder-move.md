# Pick Folder Move Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 내 픽 상점 카드에서 기존 폴더 소속을 유지하며 여러 폴더 소속을 한 번에 변경한다.

**Architecture:** `PicksScreen`이 선택한 상점 ID와 공유 `PickFolderSheet` 한 개를 소유한다. `PickShopGrid`와 `PickShopCard`는 폴더 변경 요청만 위로 전달하며, 기존 시트와 React Query 갱신 로직을 재사용한다.

**Tech Stack:** Next.js 16.3.8, React 19.2.4, TypeScript 6, TanStack Query 5, Storybook 10, Vitest 4

**Spec:** `docs/superpowers/specs/2026-11-14-pick-folder-move-design.md`

## Global Constraints

- 운영 컴포넌트 코드는 사용자가 직접 작성하고, 테스트와 Storybook 코드는 Codex가 작성한다.
- 새 API, 모델, 의존성을 추가하지 않는다.
- 카드 링크와 케밥 버튼을 중첩하지 않는다.
- 320px 이상, 최대 480px 모바일 화면과 키보드 조작을 지원한다.

## Review Focus

- 전체 탭에서도 케밥 버튼이 선택한 상점의 시트를 바로 여는지 검증한다.
- 특정 폴더 탭에서 현재 폴더를 해제하면 재조회 뒤 카드가 사라지는지 검증한다.
- 기존에 선택된 다른 폴더가 초기 체크 상태로 유지되는지 검증한다.
- 저장 실패 뒤 시트가 열린 채로 오류를 알리고 다시 저장할 수 있는지 검증한다.
- 연속 저장 클릭이 요청 한 번으로 제한되는지 검증한다.

---

### Task 1: 화면이 공유 폴더 시트를 소유

**Files:**
- Modify: `frontend/src/app/(main)/(tabs)/picks/_components/PicksScreen.tsx`
- Modify: `frontend/src/app/(main)/(tabs)/picks/_components/shop/PickShopGrid.tsx`
- Modify: `frontend/src/app/(main)/(tabs)/picks/_components/shop/PickShopCard.tsx`
- Create: `frontend/src/app/(main)/(tabs)/picks/_components/PicksScreen.stories.tsx`

**Interfaces:**
- Produces: `PickShopCard`와 `PickShopGrid`의 `onChangeFolder(shopId: string): void`
- Produces: `PicksScreen`의 `selectedShopId: string | null` 상태와 공유 `PickFolderSheet`

- [ ] **Step 1: 실패하는 Storybook 상호작용 테스트 작성**
  - 상점 상세 링크와 케밥 버튼이 각각 접근 가능한 이름을 갖는지 확인한다.
  - 첫 번째 상점의 케밥 버튼을 누르면 중간 메뉴 없이 그 상점의 시트가 열리는지 확인한다.
- [ ] **Step 2: 실패 확인**
  - Run: `pnpm --dir frontend exec vitest --project storybook --run src/app/\(main\)/\(tabs\)/picks/_components/PicksScreen.stories.tsx`
  - Expected: 상점 케밥 메뉴 버튼을 찾지 못해 실패한다.
- [ ] **Step 3: 최소 운영 코드 작성**
  - `PickShopCard`에 `onChangeFolder: (shopId: string) => void`를 추가하고 링크 밖에 케밥 버튼을 둔다.
  - 케밥 버튼은 중간 상태 없이 콜백을 바로 호출한다.
  - `PickShopGrid`는 같은 콜백을 카드에 전달한다.
  - `PicksScreen`은 선택 ID가 있을 때만 공유 시트 한 개를 렌더링한다.
- [ ] **Step 4: 통과 확인**
  - Run: Step 2와 같은 명령
  - Expected: PASS

### Task 2: 저장 성공과 현재 폴더 제거 흐름

**Files:**
- Modify: `frontend/src/app/(main)/(tabs)/picks/_components/PicksScreen.stories.tsx`
- Verify: `frontend/src/api/pick-folder/pick-folder.query.ts`

**Interfaces:**
- Consumes: Task 1의 공유 시트와 `onChangeFolder(shopId)` 계약
- Consumes: `useUpdateFolderIdsByShop(shopId)`의 기존 목록·상세 쿼리 무효화

- [ ] **Step 1: 성공 흐름 테스트 작성**
  - 현재 폴더와 다른 폴더가 체크된 초기 상태를 확인한다.
  - 현재 폴더만 해제하고 저장했을 때 `PUT` 요청의 `folderIds`가 다른 폴더를 유지하는지 확인한다.
  - 활성 폴더 목록 재조회 뒤 카드가 사라지고 폴더 수가 바뀌는지 확인한다.
- [ ] **Step 2: 실패 확인 뒤 필요한 최소 코드만 보완**
  - 쿼리 무효화로 요구사항이 충족되면 운영 코드는 추가하지 않는다.
  - 충족되지 않을 때만 저장 성공 콜백을 시트 경계에 추가한다.
- [ ] **Step 3: 통과 확인**
  - Run: Task 1의 Storybook Vitest 명령
  - Expected: PASS

### Task 3: 저장 실패와 중복 요청 방지

**Files:**
- Modify: `frontend/src/components/pick/PickFolderSheet.stories.tsx`
- Verify: `frontend/src/components/pick/PickFolderSheetContent.tsx`

**Interfaces:**
- Consumes: `PickFolderSheetContent`의 `isPending` 저장 버튼과 mutation 오류 상태

- [ ] **Step 1: 실패·재시도 Storybook 테스트 작성**
  - 첫 저장은 오류 응답, 두 번째 저장은 성공 응답을 반환한다.
  - 오류 문구와 열린 시트를 확인한 뒤 저장을 다시 눌러 성공하는지 확인한다.
  - 첫 요청이 진행되는 동안 저장 버튼이 비활성화되어 중복 요청이 없는지 확인한다.
- [ ] **Step 2: 실패 확인 뒤 필요한 최소 코드만 보완**
  - 기존 구현이 이미 통과하면 운영 코드를 바꾸지 않는다.
- [ ] **Step 3: 관련 검증 실행**
  - Run: `pnpm --dir frontend exec vitest --project storybook --run src/components/pick/PickFolderSheet.stories.tsx src/app/\(main\)/\(tabs\)/picks/_components/PicksScreen.stories.tsx`
  - Expected: PASS

### Task 4: 전체 검증

**Files:**
- Review: 위 작업의 변경 파일만 포함되는지 확인

- [ ] `pnpm --dir frontend test:unit`
- [ ] `pnpm --dir frontend exec vitest --project storybook --run`
- [ ] `pnpm --dir frontend lint`
- [ ] `pnpm --dir frontend build`
- [ ] 320px, 390px, 480px에서 카드와 시트를 확인한다.
- [ ] `git diff --check`
