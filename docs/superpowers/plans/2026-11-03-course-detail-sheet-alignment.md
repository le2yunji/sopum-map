# Course Detail Sheet Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 코스 상세 화면의 방문 순서 시트와 수정·삭제 시트의 위치와 표면 디자인을 하나로 맞춘다.

**Architecture:** 코스 정보 오버레이의 실제 상단 위치를 코스 상세 화면에서 측정해 방문 순서 시트의 펼침 오프셋으로 전달한다. 코스 상세 전용 시트 표면·손잡이 스타일을 작은 스타일 모듈에 모아 방문 순서 시트와 더보기 시트가 공유하고, 더보기 시트는 접힌 방문 순서 시트와 같은 200px 높이를 가진다.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, Tailwind CSS 4, Storybook 10, Vitest Browser

**Spec:** `docs/superpowers/specs/2026-11-03-course-detail-sheet-alignment-design.md`

## Global Constraints

- 다른 화면의 공용 `BottomSheet` 디자인은 변경하지 않는다.
- 방문 순서 시트의 접힘 높이 `200px`와 기존 드래그 전환 규칙을 유지한다.
- 수정·삭제 및 코스 데이터 동작은 변경하지 않는다.
- 320px 이상, 최대 480px 모바일 앱 너비와 안전 영역을 유지한다.

## Review Focus

- 코스 정보의 제목·설명 높이가 달라도 시트 윗선은 정보 카드의 실제 윗선과 일치해야 한다. Task 1 Storybook 테스트가 긴 콘텐츠 상태도 확인한다.
- 화면 너비와 안전 영역이 바뀌면 측정값을 다시 반영해야 한다. Task 1은 `ResizeObserver` 기반 갱신을 사용한다.
- 코스 정보 오버레이를 접어도 마지막으로 측정한 정렬 위치가 유지되어야 한다. Task 1 Storybook 테스트가 접기 후 펼침을 확인한다.
- 더보기 내용이 바뀌어도 시트는 최소 200px이고 내용이 넘치면 더 커질 수 있어야 한다. Task 2는 `min-height`를 사용한다.
- 시트가 겹쳐 있어도 더보기 대화상자의 키보드·배경 닫기 동작은 기존 공용 `BottomSheet`가 계속 담당해야 한다. Task 2는 공용 컴포넌트를 교체하지 않는다.

---

### Task 1: 방문 순서 시트를 코스 정보 오버레이에 정렬

**Files:**
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailHeader.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseVisitOrderSheet.tsx`
- Test: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx`

**Interfaces:**
- Consumes: 코스 정보 `<section>`의 DOM 위치와 기존 `EXPANDED_TOP_OFFSET` 기본값
- Produces: `CourseVisitOrderSheet`의 `expandedTopOffset: number` prop과 실제 오버레이 윗선 기반 높이

- [ ] **Step 1: Storybook에 정렬 실패 테스트 추가**

  `OtherUserCourse`에서 방문 순서를 펼친 뒤 `코스 정보` 영역과 `코스 방문 순서` 영역의 `getBoundingClientRect().top` 차이가 1px 이하인지 확인한다. `LongContent`에서는 코스 정보를 접은 뒤 펼쳐도 마지막 측정 위치가 유지되는지 확인한다.

- [ ] **Step 2: 테스트를 실행해 현재 고정 128px 때문에 실패하는지 확인**

  Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'`
  Expected: FAIL — 방문 순서 시트 top과 코스 정보 영역 top이 다름.

- [ ] **Step 3: 실제 오버레이 상단 위치 측정 구현**

  `CourseDetailHeader`에 `infoSectionRef: Ref<HTMLElement>`를 추가해 정보 영역에 연결한다. `CourseDetailScreen`은 화면 컨테이너와 정보 영역의 상대 top을 `ResizeObserver`로 측정하고 마지막 유효 값을 보관한다. `CourseVisitOrderSheet({ expandedTopOffset: number })`는 높이 계산에 전달값을 사용한다.

- [ ] **Step 4: Storybook 테스트 통과 확인**

  Run: Task 1의 Storybook 명령
  Expected: PASS

- [ ] **Step 5: 변경 검토용 저장점 생성**

  `git diff --check`를 실행하고 Task 1 파일만 하나의 논리 변경으로 검토한다.

### Task 2: 더보기 시트 높이와 두 시트 디자인 통일

**Files:**
- Create: `frontend/src/app/(main)/courses/[courseId]/_components/course-detail-sheet.styles.ts`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseVisitOrderSheet.tsx`
- Modify: `frontend/src/app/(main)/courses/[courseId]/_components/CourseMoreSheet.tsx`
- Test: `frontend/src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx`

**Interfaces:**
- Consumes: `COLLAPSED_HEIGHT = 200`, 공용 `BottomSheet`의 기존 대화상자 동작
- Produces: `COURSE_DETAIL_SHEET_SURFACE_CLASS_NAME`, `COURSE_DETAIL_SHEET_HANDLE_CLASS_NAME`, `COURSE_DETAIL_SHEET_HORIZONTAL_PADDING_CLASS_NAME`

- [ ] **Step 1: Storybook에 높이·디자인 실패 테스트 추가**

  `MyCourse`에서 더보기 시트를 연 뒤 표면 높이가 `200px`인지 확인한다. 접힌 방문 순서 시트와 더보기 시트의 계산된 상단 모서리 반경, 그림자, 손잡이 너비·높이·색상이 같은지 비교한다.

- [ ] **Step 2: 테스트를 실행해 현재 서로 다른 높이와 스타일 때문에 실패하는지 확인**

  Run: Task 1의 Storybook 명령
  Expected: FAIL — 더보기 시트 높이 또는 손잡이·표면 스타일이 다름.

- [ ] **Step 3: 코스 상세 전용 공통 스타일 적용**

  새 스타일 모듈에 시트 표면, 손잡이와 좌우 패딩 클래스를 정의한다. 방문 순서 시트가 이를 사용하게 바꾸고, `CourseMoreSheet`는 공용 `BottomSheet` 동작을 유지하면서 같은 클래스와 `min-h-[200px]`를 적용한다.

- [ ] **Step 4: 관련 테스트와 정적 검사 실행**

  Run: `pnpm --dir frontend exec vitest --project storybook --run 'src/app/(main)/courses/[courseId]/_components/CourseDetailScreen.stories.tsx'`
  Expected: PASS

  Run: `pnpm --dir frontend lint && pnpm --dir frontend exec tsc --noEmit && git diff --check`
  Expected: 모두 exit code 0

- [ ] **Step 5: 요청 범위 검토**

  `git status --short`와 관련 파일 diff를 확인해 공용 `BottomSheet` 및 코스 데이터 동작에 변경이 없는지 확인한다.
