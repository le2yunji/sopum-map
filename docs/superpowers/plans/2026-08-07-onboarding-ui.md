# Onboarding UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement issue #21 as a responsive, accessible onboarding screen that matches the Figma direction and links users to login without adding onboarding persistence.

**Architecture:** Keep the App Router page as a thin Server Component with metadata and render a focused `OnboardingScreen` presentation component. Exercise the real screen through a Storybook browser test so layout semantics and both navigation actions are protected without mocking Next.js internals.

**Tech Stack:** Next.js 16.2.12 App Router, React 19.2.4, TypeScript 5 strict mode, Tailwind CSS 4, Storybook 10, Vitest browser mode, Playwright

## Global Constraints

- Implement only issue #21; onboarding completion persistence belongs to issue #22.
- Use existing local brand assets and design tokens; do not use expiring Figma asset URLs.
- Support 320px, 390px, and 480px widths inside the existing `#mobile-app` frame.
- Respect `prefers-reduced-motion` for decorative motion.
- Give every interactive element an accessible name and visible focus treatment.
- Keep functions focused and add a short purpose comment immediately above every new function.
- Do not stage `.agents/`, root `AGENTS.md`, or `MEMORY.md`.

---

### Task 1: Onboarding screen contract and responsive UI

**Files:**
- Create: `frontend/src/app/onboarding/_components/OnboardingScreen.tsx`
- Create: `frontend/src/app/onboarding/_components/OnboardingScreen.stories.tsx`
- Modify: `frontend/src/app/onboarding/page.tsx`

**Interfaces:**
- Consumes: Next.js `Link` and `Image`, `/images/brand/sopum-map-logo.svg`, and `/images/brand/sopum-map-symbol.svg`.
- Produces: `OnboardingScreen(): React.JSX.Element`, rendered by the `/onboarding` route.

- [x] **Step 1: Write the failing browser test in the story**

Create `OnboardingScreen.stories.tsx` with the real component import and this interaction contract:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { OnboardingScreen } from "./OnboardingScreen";

const meta = {
  title: "Pages/Onboarding",
  component: OnboardingScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof OnboardingScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "소품지도" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", { name: "시작하기" }),
    ).toHaveAttribute("href", "/login");
    await expect(
      canvas.getByRole("link", { name: "로그인하기" }),
    ).toHaveAttribute("href", "/login");
  },
};
```

- [x] **Step 2: Run the story test and verify RED**

Run: `pnpm --dir frontend exec vitest run --project=storybook src/app/onboarding/_components/OnboardingScreen.stories.tsx`

Expected: FAIL because `./OnboardingScreen` does not exist.

- [x] **Step 3: Implement the smallest complete screen**

Create `OnboardingScreen.tsx` as a Server Component. It must render:

```tsx
<main className="relative flex min-h-dvh flex-col overflow-hidden bg-white px-5">
  {/* two aria-hidden ambient green circles */}
  <section aria-labelledby="onboarding-title">
    {/* local symbol image with motion-safe animation */}
    <h1 id="onboarding-title">소품지도</h1>
    <p>취향에 맞는 소품샵을 찾고, 내 픽으로 모아 코스를 만들어봐.</p>
  </section>
  <div>
    <Link
      href="/login"
      className="flex min-h-15 w-full items-center justify-center rounded-2xl bg-green-500 px-5 text-18 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
    >
      시작하기
    </Link>
    <Link
      href="/login"
      className="flex min-h-12 items-center justify-center rounded-xl px-4 text-14 text-black-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
    >
      로그인하기
    </Link>
  </div>
  <p>© 2026 Sopumjido</p>
</main>
```

Use `Link` as both navigation elements and reproduce the existing large primary button styles with design tokens. Do not nest an interactive link inside a `<button>`.

Update `page.tsx` to export metadata with title `온보딩` and render `<OnboardingScreen />`. Add a short purpose comment above both component functions.

- [x] **Step 4: Run the story test and verify GREEN**

Run: `pnpm --dir frontend exec vitest run --project=storybook src/app/onboarding/_components/OnboardingScreen.stories.tsx`

Expected: PASS with 1 story and no accessibility query failures.

- [x] **Step 5: Refactor while green**

Check that decorative images use empty alt text, the meaningful brand symbol has `alt="소품지도 캐릭터"`, focus styles remain visible, and no duplicated layout constants are introduced. Re-run the Step 4 command.

- [x] **Step 6: Commit the issue implementation**

Run:

```bash
git add frontend/src/app/onboarding/page.tsx \
  frontend/src/app/onboarding/_components/OnboardingScreen.tsx \
  frontend/src/app/onboarding/_components/OnboardingScreen.stories.tsx
git diff --staged --check
git commit -m "Feat: 온보딩 페이지 UI 구현"
```

### Task 2: Route-level fallback and visual verification

**Files:**
- Create: `frontend/src/app/onboarding/loading.tsx`
- Create: `frontend/src/app/onboarding/error.tsx`
- Create: `frontend/src/components/ui/Skeleton/Skeleton.tsx`
- Create: `frontend/src/components/ui/Skeleton/Skeleton.stories.tsx`

**Interfaces:**
- Produces: `Skeleton({ className?, label? }): React.JSX.Element`, `OnboardingLoading(): React.JSX.Element`, and the Next.js route error component accepting `{ error, unstable_retry }`.
- Consumes: Next.js 16 `error.tsx` contract using `unstable_retry`, confirmed in local framework documentation.

- [x] **Step 1: Write the failing Skeleton story test**

Create a Skeleton story that renders the real component and asserts `role="status"` has accessible name `콘텐츠를 불러오는 중` while its visual blocks are `aria-hidden="true"`.

- [x] **Step 2: Run the Skeleton story test and verify RED**

Run: `pnpm --dir frontend exec vitest run --project=storybook src/components/ui/Skeleton/Skeleton.stories.tsx`

Expected: FAIL because `Skeleton.tsx` does not exist.

- [x] **Step 3: Implement Skeleton and route fallbacks**

`Skeleton` accepts `className?: string` and `label?: string`, defaults the label to `콘텐츠를 불러오는 중`, uses `motion-safe:animate-pulse`, and exposes one concise live loading status. `loading.tsx` composes fixed-size blocks matching the onboarding symbol, copy, and action layout.

`error.tsx` must be a Client Component. Log the unexpected error in `useEffect`, render `온보딩 화면을 불러오지 못했어` with a primary retry button calling `unstable_retry`, and provide a `/login` link so the user is never trapped. Add purpose comments above every new function.

- [x] **Step 4: Run the Skeleton story test and verify GREEN**

Run: `pnpm --dir frontend exec vitest run --project=storybook src/components/ui/Skeleton/Skeleton.stories.tsx`

Expected: PASS with one concise loading announcement.

- [x] **Step 5: Run issue-level verification**

Run:

```bash
pnpm --dir frontend exec vitest run --project=storybook
pnpm --dir frontend lint
pnpm --dir frontend build
git diff --check
```

Expected: all commands exit 0. Then inspect `/onboarding` at 320px, 390px, and 480px, verify both links, keyboard focus, reduced-motion behavior, and an empty browser console.

- [x] **Step 6: Commit fallbacks**

Run:

```bash
git add frontend/src/app/onboarding/loading.tsx \
  frontend/src/app/onboarding/error.tsx \
  frontend/src/components/ui/Skeleton/Skeleton.tsx \
  frontend/src/components/ui/Skeleton/Skeleton.stories.tsx
git diff --staged --check
git commit -m "Feat: 온보딩 로딩 및 오류 화면 추가"
```

### Task 3: PR preparation

**Files:**
- Modify: `docs/superpowers/plans/2026-08-07-onboarding-ui.md` by checking completed steps.

**Interfaces:**
- Produces: a verified branch `feat/21/onboarding-ui` and a PR targeting `dev` that closes issue #21.

- [x] **Step 1: Re-run fresh verification**

Run the full Storybook Vitest project, frontend lint, frontend build, `git diff --check`, `git status --short`, and `git diff dev...HEAD --name-only`.

- [x] **Step 2: Verify scope and sensitive data**

Confirm the diff contains only the design/spec docs, this plan, onboarding files, and the shared Skeleton. Confirm it contains no `.env`, credential, `.agents/`, root `AGENTS.md`, or `MEMORY.md` files.

- [ ] **Step 3: Commit the completed plan checklist**

Run:

```bash
git add docs/superpowers/plans/2026-08-07-onboarding-ui.md
git commit -m "Docs: 온보딩 UI 구현 계획 완료"
```

- [ ] **Step 4: Push and create the PR**

Push `feat/21/onboarding-ui`, create a PR targeting `dev`, use `.github/pull_request_template.md`, set `Closes #21`, include exact verification results, and keep the worktree for review feedback.
