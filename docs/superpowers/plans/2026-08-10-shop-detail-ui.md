# Shop Detail UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement issue #36 as a complete fixture-backed shop detail page with reusable overlay interactions and defensive view states.

**Architecture:** Keep the dynamic route as a thin server boundary and place display data, local UI state, and interactions in a client `ShopDetailScreen`. Split the image carousel from the long page so image navigation and fallback behavior remain independently testable. Use the existing Modal and BottomSheet primitives without API calls.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS 4, Storybook 10, Vitest browser mode, Playwright Chromium

## Global Constraints

- Use local images and fixture display models only; API integration remains in issue #37.
- Reuse `Button`, `Badge`, `Modal`, and `BottomSheet` from their public interfaces.
- Write polite Korean for every visible message.
- Preserve accessible names, native links, keyboard focus, and `aria-pressed` state.
- Provide success, loading, empty, and error states.
- Support 320px, 390px, and 480px without horizontal overflow.
- Add a short purpose comment above every new function.

---

### Task 1: Shop content and defensive states

**Files:**
- Create: `frontend/src/app/(main)/shops/[shopId]/_types/shop-detail.types.ts`
- Create: `frontend/src/app/(main)/shops/[shopId]/_data/shop-detail.fixture.ts`
- Create: `frontend/src/app/(main)/shops/[shopId]/_components/ShopImageGallery.tsx`
- Create: `frontend/src/app/(main)/shops/[shopId]/_components/ShopDetailScreen.tsx`
- Create: `frontend/src/app/(main)/shops/[shopId]/_components/ShopDetailScreen.stories.tsx`

**Interfaces:**
- Produces: `ShopDetailView`, `ShopReviewPreview`, `ShopDetailViewState`, `SHOP_DETAIL_FIXTURE`, and `ShopDetailScreen`.
- Consumes: local shop images, `Button`, `Badge`, and Next.js `Image`/`Link`.

- [ ] Write a failing `Success` story that expects the shop heading, category and tags, address, hours, phone, Instagram, Naver Map, location preview, two review previews, and `/shops/shop-1/reviews/new` link.
- [ ] Run the focused Storybook test and verify RED because the screen module does not exist.
- [ ] Define strict display-model types and a complete local fixture with no API-shaped wrapper.
- [ ] Implement the image gallery and the semantic page sections with safe image and optional-field fallbacks.
- [ ] Add `Loading`, `Empty`, and `Error` stories with recovery actions and verify all focused stories pass.
- [ ] Run scoped ESLint and `git diff --check`.
- [ ] Commit with `Feat: 상점 상세 정보 화면 구현`.

---

### Task 2: Local interactions and overlays

**Files:**
- Modify: `frontend/src/app/(main)/shops/[shopId]/_components/ShopDetailScreen.tsx`
- Modify: `frontend/src/app/(main)/shops/[shopId]/_components/ShopDetailScreen.stories.tsx`
- Modify: `frontend/src/app/(main)/shops/[shopId]/_components/ShopImageGallery.tsx`

**Interfaces:**
- Consumes: Task 1 display model plus existing `BottomSheet` and `Modal`.
- Produces: local like state, image navigation, pick-folder selection, and report completion flow.

- [ ] Add failing browser assertions for carousel next/previous, `aria-pressed` like state, pick-folder BottomSheet selection, and report BottomSheet to completion Modal transition.
- [ ] Run the focused stories and verify failures occur at missing interactions.
- [ ] Implement only local state transitions. Close one overlay before opening the next and expose confirmation through visible status text.
- [ ] Verify Escape/backdrop behavior remains owned by shared overlay primitives.
- [ ] Run focused stories, scoped ESLint, and `git diff --check`.
- [ ] Commit with `Feat: 상점 상세 상호작용 구현`.

---

### Task 3: Dynamic route and route boundaries

**Files:**
- Modify: `frontend/src/app/(main)/shops/[shopId]/page.tsx`
- Create: `frontend/src/app/(main)/shops/[shopId]/loading.tsx`
- Create: `frontend/src/app/(main)/shops/[shopId]/error.tsx`

**Interfaces:**
- Consumes: `PageProps<"/shops/[shopId]">`, `SHOP_DETAIL_FIXTURE`, and `ShopDetailScreen`.
- Produces: `/shops/[shopId]` fixture route with Next.js loading and error boundaries.

- [ ] Replace the placeholder page with an async page that awaits `params` and passes the route `shopId` into the fixture display model.
- [ ] Add route-level loading and retryable error UI using polite copy.
- [ ] Run scoped lint and production build after building `@sopum-map/shared`.
- [ ] Commit with `Feat: 상점 상세 라우트 연결`.

---

### Task 4: Full verification and stacked PR

**Files:**
- Modify: `docs/superpowers/plans/2026-08-10-shop-detail-ui.md`

**Interfaces:**
- Consumes: completed page, stories, and route boundaries.
- Produces: verified branch and stacked PR based on `feat/20/bottom-sheet` with `Closes #36`.

- [ ] Run the full Storybook suite, frontend lint, production build, and `git diff --check feat/20/bottom-sheet...HEAD`.
- [ ] Inspect success, empty, and error states in Chromium at 320px, 390px, and 480px with no overflow or console errors.
- [ ] Verify like, carousel, folder, report, Escape, and focus flows with keyboard-capable browser interactions.
- [ ] Review the diff so only #36 plan and shop-detail route files appear.
- [ ] Push `feat/36/shop-detail-ui` and create a stacked PR to `feat/20/bottom-sheet` with `Closes #36`.
