# First-Visit Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a mascot onboarding screen once per browser for 1.5 seconds before the home or login page, then return to the original safe destination.

**Architecture:** A Next.js 16 `proxy.ts` checks a one-year completion cookie before `/` and `/login` render. The restored onboarding route validates its `next` query, renders a client transition component, records the cookie after 1.5 seconds, and replaces the route. A presentation-only `BrandLoadingScreen` is shared by onboarding and route loading UIs.

**Tech Stack:** Next.js 16 App Router and Proxy, React 19, TypeScript strict mode, Storybook 10 browser tests, Vitest, Playwright.

## Global Constraints

- Use `/images/brand/sopum-map-mascot.svg` at its 114×135 aspect ratio.
- Do not render start or login buttons on the onboarding screen.
- Store `sopum_onboarding_completed=1` for 31,536,000 seconds with `Path=/` and `SameSite=Lax`; add `Secure` on HTTPS.
- Redirect only `/` and `/login`; never redirect static assets or `/onboarding` itself.
- Accept only internal destinations beginning with one `/`; fall back to `/` for empty, external, or protocol-relative values.
- Preserve existing user-created loading files and use the shared brand screen where compatible.
- Add a short purpose comment immediately above every new function.

---

## File Structure

- Create `frontend/src/lib/onboarding/onboarding.constants.ts`: cookie name, value, and transition duration.
- Create `frontend/src/lib/onboarding/onboarding.ts`: destination validation and cookie serialization.
- Create `frontend/src/lib/onboarding/onboarding.test.ts`: pure helper tests.
- Create `frontend/src/proxy.ts`: first-visit redirect before route rendering.
- Create `frontend/src/proxy.test.ts`: proxy redirect and pass-through tests.
- Create `frontend/vitest.unit.config.ts`: Node-environment unit-test configuration.
- Modify `frontend/package.json`: add `test:unit` script.
- Modify `frontend/src/app/_components/BrandLoadingScreen.tsx`: presentation-only mascot screen.
- Modify `frontend/src/app/_components/BrandLoadingScreen.stories.tsx`: correct component import and visible-content assertions.
- Restore `frontend/src/app/onboarding/page.tsx`: metadata, async search params, safe destination.
- Restore `frontend/src/app/onboarding/_components/OnboardingScreen.tsx`: timer, cookie, and route replacement.
- Restore `frontend/src/app/onboarding/loading.tsx`: onboarding route fallback.
- Restore `frontend/src/app/onboarding/error.tsx`: route error recovery.
- Remove obsolete `frontend/src/app/onboarding/_components/OnboardingScreen.stories.tsx`: the shared screen story replaces it.
- Preserve `frontend/src/app/loading.tsx` and `frontend/src/app/login/loading.tsx`: both reuse `BrandLoadingScreen`.

---

### Task 1: Pure Onboarding Rules and Unit-Test Setup

**Files:**
- Create: `frontend/vitest.unit.config.ts`
- Modify: `frontend/package.json`
- Create: `frontend/src/lib/onboarding/onboarding.constants.ts`
- Create: `frontend/src/lib/onboarding/onboarding.test.ts`
- Create: `frontend/src/lib/onboarding/onboarding.ts`

**Interfaces:**
- Produces: `ONBOARDING_COOKIE_NAME`, `ONBOARDING_COOKIE_VALUE`, `ONBOARDING_COOKIE_MAX_AGE`, `ONBOARDING_TRANSITION_MS`.
- Produces: `normalizeOnboardingDestination(value: string | string[] | undefined): string`.
- Produces: `createOnboardingCookie(isSecure: boolean): string`.

- [ ] **Step 1: Add Node unit-test configuration and script**

Create `vitest.unit.config.ts` with `defineConfig({ test: { environment: "node", include: ["src/**/*.test.ts"] } })`. Add `"test:unit": "vitest run --config vitest.unit.config.ts"` to frontend scripts.

- [ ] **Step 2: Write failing helper tests**

Test that `/`, `/login`, and `/shops/123?tab=info` are preserved; `undefined`, arrays, `https://evil.example`, and `//evil.example` become `/`. Test HTTP and HTTPS cookie strings, including the one-year max age and conditional `Secure`.

- [ ] **Step 3: Run tests and confirm RED**

Run: `pnpm --dir frontend test:unit -- src/lib/onboarding/onboarding.test.ts`

Expected: FAIL because helper modules do not exist.

- [ ] **Step 4: Implement the constants and pure helpers**

Use one leading slash and reject a second leading slash. Serialize exactly `sopum_onboarding_completed=1; Path=/; Max-Age=31536000; SameSite=Lax`, appending `; Secure` only for HTTPS.

- [ ] **Step 5: Run tests and confirm GREEN**

Run: `pnpm --dir frontend test:unit -- src/lib/onboarding/onboarding.test.ts`

Expected: all helper tests pass.

- [ ] **Step 6: Commit the independently testable rules**

```bash
git add frontend/package.json frontend/vitest.unit.config.ts frontend/src/lib/onboarding
git commit -m "test: 온보딩 이동 규칙 추가"
```

### Task 2: First-Visit Proxy

**Files:**
- Create: `frontend/src/proxy.test.ts`
- Create: `frontend/src/proxy.ts`

**Interfaces:**
- Consumes: `ONBOARDING_COOKIE_NAME` and `ONBOARDING_COOKIE_VALUE`.
- Produces: `proxy(request: NextRequest): NextResponse` and `config.matcher` for `/` and `/login`.

- [ ] **Step 1: Write failing proxy tests**

Construct `NextRequest` instances for `http://localhost:3000/` and `/login`. Assert missing cookies redirect to `/onboarding` with the exact original pathname in `next`. Assert the completion cookie returns a non-redirect response.

- [ ] **Step 2: Run tests and confirm RED**

Run: `pnpm --dir frontend test:unit -- src/proxy.test.ts`

Expected: FAIL because `src/proxy.ts` does not exist.

- [ ] **Step 3: Implement minimal Proxy behavior**

Read the completion cookie from `request.cookies`. Return `NextResponse.next()` only when its value is `1`; otherwise clone `request.nextUrl`, set pathname `/onboarding`, set `next` to the original pathname plus search, and return `NextResponse.redirect(url)`.

- [ ] **Step 4: Run tests and confirm GREEN**

Run: `pnpm --dir frontend test:unit -- src/proxy.test.ts`

Expected: proxy tests pass.

- [ ] **Step 5: Commit Proxy**

```bash
git add frontend/src/proxy.ts frontend/src/proxy.test.ts
git commit -m "feat: 첫 방문 온보딩 리다이렉트 추가"
```

### Task 3: Shared Mascot Loading Screen

**Files:**
- Modify: `frontend/src/app/_components/BrandLoadingScreen.tsx`
- Modify: `frontend/src/app/_components/BrandLoadingScreen.stories.tsx`
- Preserve: `frontend/src/app/loading.tsx`
- Preserve: `frontend/src/app/login/loading.tsx`

**Interfaces:**
- Produces: `BrandLoadingScreen(): React.ReactNode`, with no navigation or state side effects.

- [ ] **Step 1: Make the story fail against the required UI**

Import `BrandLoadingScreen` from `./BrandLoadingScreen`. Assert the `소품지도` heading and an image named `소품지도 마스코트` exist. Assert links named `시작하기` and `로그인하기` do not exist. Keep 320px and 480px viewport stories.

- [ ] **Step 2: Run the story test and confirm RED**

Run: `pnpm --dir frontend exec vitest run --project storybook frontend/src/app/_components/BrandLoadingScreen.stories.tsx`

Expected: FAIL because the story imports a missing `OnboardingScreen` and the current image is the symbol.

- [ ] **Step 3: Implement the presentation-only screen**

Remove `Link`, commented buttons, and decorative clover glyphs. Render `/images/brand/sopum-map-mascot.svg` with width `114`, height `135`, priority, and alt `소품지도 마스코트`. Keep the heading, copy, safe-area spacing, and background decorations.

- [ ] **Step 4: Run the story test and confirm GREEN**

Run: `pnpm --dir frontend exec vitest run --project storybook frontend/src/app/_components/BrandLoadingScreen.stories.tsx`

Expected: all BrandLoadingScreen stories pass.

- [ ] **Step 5: Commit the shared screen and existing loading entry points**

```bash
git add frontend/public/images/brand/sopum-map-mascot.svg frontend/src/app/_components frontend/src/app/loading.tsx frontend/src/app/login/loading.tsx
git commit -m "feat: 공용 마스코트 로딩 화면 추가"
```

### Task 4: Restore and Connect the Onboarding Route

**Files:**
- Restore: `frontend/src/app/onboarding/page.tsx`
- Restore: `frontend/src/app/onboarding/_components/OnboardingScreen.tsx`
- Restore: `frontend/src/app/onboarding/loading.tsx`
- Restore: `frontend/src/app/onboarding/error.tsx`
- Delete: `frontend/src/app/onboarding/_components/OnboardingScreen.stories.tsx`

**Interfaces:**
- Consumes: `normalizeOnboardingDestination`, `createOnboardingCookie`, `ONBOARDING_TRANSITION_MS`, and `BrandLoadingScreen`.
- Produces: `OnboardingScreen({ destination }: { destination: string })`.

- [ ] **Step 1: Restore route support files with the new contract**

Restore metadata and robots settings in `page.tsx`. Type `searchParams` as `Promise<{ next?: string | string[] }>` for Next.js 16, await it, normalize `next`, and pass `destination` to the screen. Restore the existing skeleton and error boundary with their purpose comments.

- [ ] **Step 2: Implement the 1.5-second transition**

Mark `OnboardingScreen.tsx` with `"use client"`. In `useEffect`, start one timeout for `ONBOARDING_TRANSITION_MS`. On completion, write `document.cookie = createOnboardingCookie(window.location.protocol === "https:")` and call `router.replace(destination)`. Return `clearTimeout(timeoutId)` from the effect. Render only `BrandLoadingScreen`.

- [ ] **Step 3: Run focused unit and story tests**

Run: `pnpm --dir frontend test:unit`

Run: `pnpm --dir frontend exec vitest run --project storybook frontend/src/app/_components/BrandLoadingScreen.stories.tsx`

Expected: all tests pass.

- [ ] **Step 4: Verify real browser flow**

Start `pnpm --dir frontend dev`. With a fresh browser context, visit `/`, assert the URL becomes `/onboarding?next=%2F`, assert the mascot is visible, wait 1.5 seconds, assert the URL becomes `/`, and assert the completion cookie exists. Repeat `/login` in the same context and assert it does not redirect to onboarding.

- [ ] **Step 5: Run project checks**

Run: `pnpm --dir frontend lint`

Run: `pnpm --dir frontend build`

Run: `git diff --check`

Expected: all commands exit 0.

- [ ] **Step 6: Commit the restored route**

```bash
git add frontend/src/app/onboarding
git commit -m "feat: 온보딩 자동 이동 흐름 연결"
```

### Task 5: Final Scope Review

**Files:**
- Review: all files changed from `dev`.
- Review: `MEMORY.md` without modifying it unless its implementation snapshot became inaccurate.

- [ ] **Step 1: Inspect the final diff and commit list**

Run: `git diff --stat dev...HEAD`

Run: `git log --oneline dev..HEAD`

Confirm no unrelated files or secrets are included.

- [ ] **Step 2: Re-run the complete verification set**

Run: `pnpm --dir frontend test:unit && pnpm --dir frontend lint && pnpm --dir frontend build && git diff --check`

Expected: unit tests, lint, build, and whitespace checks all pass.
