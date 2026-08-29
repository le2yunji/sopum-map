# Onboarding UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a button-free 1.5-second brand splash, teach first-time visitors four core features, and save the completion cookie only when the final button sends them home.

**Architecture:** Keep timing and carousel decisions in small pure utilities, while `OnboardingScreen` owns the splash-to-carousel phase and one-time completion action. `OnboardingCarousel` owns page navigation and focus, and `OnboardingSlide` only renders one slide from static content.

**Tech Stack:** Next.js 16.3.2 App Router, React 19.2.4, TypeScript 6.0.3, Tailwind CSS 4, Vitest 4, Storybook 10.5.2

**Spec:** `docs/superpowers/specs/2026-08-29-onboarding-ui-design.md`

## Global Constraints

- Reuse the existing color tokens, shared `Button`, local brand images, and existing icon components.
- Support the mobile application frame from 320px through 480px.
- Keep the splash free of buttons, indicators, and other user input.
- Save the completion cookie only from `소품지도 시작하기`, then navigate to `/`.
- Support previous/next buttons, left/right arrow keys, horizontal swipe, visible focus, and reduced motion.
- Do not add an external UI or animation dependency.
- Preserve unrelated and user-owned working-tree changes.

---

## File Map

- `frontend/src/lib/onboarding/onboarding.constants.ts`: cookie and 1.5-second splash constants.
- `frontend/src/lib/onboarding/onboarding.ts`: cookie creation and cancellable splash timer.
- `frontend/src/app/onboarding/_components/onboarding-carousel.ts`: pure bounded page and swipe-direction helpers.
- `frontend/src/app/onboarding/_components/onboarding-carousel.test.ts`: unit coverage for navigation boundaries and swipe thresholds.
- `frontend/src/app/onboarding/_components/onboarding-slides.tsx`: typed static slide copy and existing visual components.
- `frontend/src/app/onboarding/_components/OnboardingSlide.tsx`: presentational slide layout.
- `frontend/src/app/onboarding/_components/OnboardingCarousel.tsx`: interactive navigation, swipe, keyboard, indicators, and focus.
- `frontend/src/app/onboarding/_components/OnboardingScreen.tsx`: splash phase, completion cookie, and home replacement.
- `frontend/src/app/onboarding/_components/OnboardingCarousel.stories.tsx`: interaction and viewport checks.
- `frontend/src/app/_components/BrandSplashScreen.tsx`: Figma-aligned, button-free splash.
- `frontend/src/app/_components/BrandLoadingScreen.stories.tsx`: splash semantic and viewport checks.
- `frontend/src/app/onboarding/page.tsx`: simple first-visit route without destination input.
- `frontend/src/proxy.ts`: first-visit redirect without a `next` query.
- `frontend/src/proxy.test.ts`: redirect contract for first and returning visitors.
- `frontend/src/app/onboarding/loading.tsx`: final-layout-shaped loading state.
- `frontend/src/app/globals.css`: reduced-motion-safe slide transition keyframes only if utility classes cannot express them.

---

### Task 1: Lock the first-visit routing contract

**Files:**
- Modify: `frontend/src/proxy.test.ts`
- Modify: `frontend/src/proxy.ts`
- Modify: `frontend/src/app/onboarding/page.tsx`

**Interfaces:**
- Consumes: `ONBOARDING_COOKIE_NAME`, `ONBOARDING_COOKIE_VALUE`
- Produces: `proxy(request: NextRequest): NextResponse`; `/onboarding` always completes to `/`

- [ ] **Step 1: Change the proxy tests to require a clean onboarding URL**

```ts
it.each(["/", "/login", "/login?from=home"])(
  "첫 방문 요청 %s를 온보딩으로 보낸다",
  (path) => {
    const response = proxy(createRequest(path));
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(307);
    expect(location.pathname).toBe("/onboarding");
    expect(location.search).toBe("");
  },
);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/proxy.test.ts`

Expected: FAIL because the current proxy still adds a `next` query parameter.

- [ ] **Step 3: Remove destination propagation and simplify the page**

```ts
// proxy.ts
const onboardingUrl = request.nextUrl.clone();
onboardingUrl.pathname = "/onboarding";
onboardingUrl.search = "";
return NextResponse.redirect(onboardingUrl);

// app/onboarding/page.tsx
export default function OnboardingPage() {
  return <OnboardingScreen />;
}
```

Remove `normalizeOnboardingDestination` from the page imports. Keep the utility itself until Task 4 confirms it has no consumers.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/proxy.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the routing slice**

```bash
git add frontend/src/proxy.ts frontend/src/proxy.test.ts frontend/src/app/onboarding/page.tsx
git commit -m "feat: route first visits through onboarding"
```

---

### Task 2: Build and test bounded carousel decisions

**Files:**
- Create: `frontend/src/app/onboarding/_components/onboarding-carousel.ts`
- Create: `frontend/src/app/onboarding/_components/onboarding-carousel.test.ts`

**Interfaces:**
- Produces: `getPreviousSlide(index: number): number`
- Produces: `getNextSlide(index: number, slideCount: number): number`
- Produces: `getSwipeDirection(startX: number, endX: number): "previous" | "next" | null`

- [ ] **Step 1: Write failing boundary and swipe tests**

```ts
import { describe, expect, it } from "vitest";
import {
  getNextSlide,
  getPreviousSlide,
  getSwipeDirection,
} from "./onboarding-carousel";

describe("onboarding carousel navigation", () => {
  it("첫 페이지보다 이전으로 이동하지 않는다", () => {
    expect(getPreviousSlide(0)).toBe(0);
  });

  it("마지막 페이지보다 다음으로 이동하지 않는다", () => {
    expect(getNextSlide(3, 4)).toBe(3);
  });

  it.each([
    [160, 100, "next"],
    [100, 160, "previous"],
    [100, 125, null],
  ] as const)("%spx에서 %spx로 움직인 스와이프를 판정한다", (start, end, expected) => {
    expect(getSwipeDirection(start, end)).toBe(expected);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/app/onboarding/_components/onboarding-carousel.test.ts`

Expected: FAIL because `onboarding-carousel.ts` does not exist.

- [ ] **Step 3: Add the minimal pure helpers**

```ts
const SWIPE_THRESHOLD_PX = 48;

/** 첫 페이지를 벗어나지 않는 이전 위치를 반환합니다. */
export function getPreviousSlide(index: number): number {
  return Math.max(0, index - 1);
}

/** 마지막 페이지를 벗어나지 않는 다음 위치를 반환합니다. */
export function getNextSlide(index: number, slideCount: number): number {
  return Math.min(slideCount - 1, index + 1);
}

/** 충분히 긴 가로 동작만 페이지 이동으로 해석합니다. */
export function getSwipeDirection(startX: number, endX: number) {
  const distance = endX - startX;
  if (Math.abs(distance) < SWIPE_THRESHOLD_PX) return null;
  return distance > 0 ? "previous" : "next";
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/app/onboarding/_components/onboarding-carousel.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the tested state model**

```bash
git add frontend/src/app/onboarding/_components/onboarding-carousel.ts frontend/src/app/onboarding/_components/onboarding-carousel.test.ts
git commit -m "test: define onboarding carousel navigation"
```

---

### Task 3: Render the four accessible onboarding pages

**Files:**
- Create: `frontend/src/app/onboarding/_components/onboarding-slides.tsx`
- Create: `frontend/src/app/onboarding/_components/OnboardingSlide.tsx`
- Create: `frontend/src/app/onboarding/_components/OnboardingCarousel.tsx`
- Create: `frontend/src/app/onboarding/_components/OnboardingCarousel.stories.tsx`

**Interfaces:**
- Produces: `OnboardingSlideData` with `id`, `title`, `description`, `visual`
- Produces: `ONBOARDING_SLIDES: readonly OnboardingSlideData[]`
- Produces: `OnboardingCarousel({ onComplete }: { onComplete: () => void })`
- Consumes: Task 2 navigation helpers and shared `Button`

- [ ] **Step 1: Write a Storybook interaction that describes the visible flow**

```tsx
export const CompleteFlow: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "취향에 맞는 소품샵을 발견해요" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "다음" }));
    await expect(canvas.getByRole("heading", { name: "마음에 드는 곳은 내 픽에 모아요" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "소품지도 시작하기" })).toBeInTheDocument();
  },
};
```

Add `SmallMobile` and `LargeMobile` stories using the existing `sopumSmall` and `sopumLarge` viewport globals.

- [ ] **Step 2: Run the focused Storybook test and verify RED**

Run: `pnpm --dir frontend exec vitest --project storybook --run frontend/src/app/onboarding/_components/OnboardingCarousel.stories.tsx`

Expected: FAIL because the carousel component does not exist.

- [ ] **Step 3: Define the four static slides from existing visuals**

Use `/images/brand/mascot.webp`, `/images/brand/mascot-v2.webp`, `HeartIcon`, `LocationIcon`, `CameraIcon`, and `CommentIcon`. Each `visual` is JSX, uses fixed width and height, and marks decorative icon layers with `aria-hidden="true"`.

```ts
export type OnboardingSlideData = Readonly<{
  id: "discover" | "pick" | "course" | "visit";
  title: string;
  description: string;
  visual: ReactNode;
}>;
```

- [ ] **Step 4: Implement the presentational slide and interactive carousel**

`OnboardingSlide` renders one `article`, one focusable `h1`, the visual, and description. `OnboardingCarousel` starts at index `0`, stores pointer start X in a ref, uses Task 2 helpers for every navigation path, and focuses the active heading after an actual page change.

Use this navigation structure:

```tsx
<nav aria-label="온보딩 페이지 이동" className="w-full">
  <p className="sr-only" aria-live="polite">
    {`${slides.length}페이지 중 ${currentIndex + 1}페이지`}
  </p>
  <ol aria-hidden="true" className="flex justify-center gap-2">
    {slides.map((slide, index) => (
      <li
        key={slide.id}
        className={index === currentIndex ? "h-2 w-6 rounded-full bg-green-500" : "size-2 rounded-full bg-black-200"}
      />
    ))}
  </ol>
  <div className="mt-6 flex items-center gap-2">
    {currentIndex > 0 && <Button variant="ghost" size="large">이전</Button>}
    <Button fullWidth size="large">
      {isLastSlide ? "소품지도 시작하기" : "다음"}
    </Button>
  </div>
</nav>
```

The root receives `tabIndex={0}`, `onKeyDown`, `onPointerDown`, and `onPointerUp`. Only the last button calls `onComplete`.

- [ ] **Step 5: Run the focused Storybook test and verify GREEN**

Run: `pnpm --dir frontend exec vitest --project storybook --run frontend/src/app/onboarding/_components/OnboardingCarousel.stories.tsx`

Expected: PASS with no accessibility error.

- [ ] **Step 6: Commit the carousel UI**

```bash
git add frontend/src/app/onboarding/_components/onboarding-slides.tsx frontend/src/app/onboarding/_components/OnboardingSlide.tsx frontend/src/app/onboarding/_components/OnboardingCarousel.tsx frontend/src/app/onboarding/_components/OnboardingCarousel.stories.tsx
git commit -m "feat: add four-page onboarding guide"
```

---

### Task 4: Connect the splash and one-time completion action

**Files:**
- Modify: `frontend/src/app/onboarding/_components/OnboardingScreen.tsx`
- Modify: `frontend/src/lib/onboarding/onboarding.ts`
- Modify: `frontend/src/lib/onboarding/onboarding.test.ts`
- Modify: `frontend/src/app/_components/BrandSplashScreen.tsx`
- Modify: `frontend/src/app/_components/BrandLoadingScreen.stories.tsx`

**Interfaces:**
- Consumes: `startOnboardingTransition`, `createOnboardingCookie`, `OnboardingCarousel`
- Produces: `OnboardingScreen()` that transitions from splash to carousel and completes once to `/`

- [ ] **Step 1: Change utility tests to remove destination normalization while preserving timer and cookie contracts**

Delete the `normalizeOnboardingDestination` test block and import. Keep the literal cookie and 1,499ms/1,500ms timer assertions unchanged.

- [ ] **Step 2: Run the utility test and verify RED**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/lib/onboarding/onboarding.test.ts`

Expected: FAIL after deleting `normalizeOnboardingDestination` from production, or TypeScript import failure until the test and implementation agree.

- [ ] **Step 3: Remove the unused destination helper and implement two phases**

```tsx
export function OnboardingScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"splash" | "guide">("splash");
  const completedRef = useRef(false);

  useEffect(() => startOnboardingTransition(() => setPhase("guide")), []);

  /** 완료 상태를 한 번만 저장하고 홈 화면으로 이동합니다. */
  function completeOnboarding() {
    if (completedRef.current) return;
    completedRef.current = true;
    document.cookie = createOnboardingCookie(window.location.protocol === "https:");
    router.replace("/");
  }

  return phase === "splash" ? (
    <BrandSplashScreen />
  ) : (
    <OnboardingCarousel onComplete={completeOnboarding} />
  );
}
```

Update `BrandSplashScreen` to match Figma copy exactly: `행운을 찾는 소품산책`. Keep the existing local mascot, `SparkleIcon`, soft green backgrounds, semantic heading, safe-area padding, and reduced-motion animation. Do not add a button.

- [ ] **Step 4: Strengthen the splash story**

Assert the heading, mascot image, tagline, and absence of any button:

```ts
await expect(canvas.getByText("행운을 찾는 소품산책")).toBeInTheDocument();
await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
```

- [ ] **Step 5: Run utility and splash Storybook tests and verify GREEN**

Run: `pnpm --dir frontend exec vitest run --config vitest.unit.config.ts src/lib/onboarding/onboarding.test.ts`

Run: `pnpm --dir frontend exec vitest --project storybook --run frontend/src/app/_components/BrandLoadingScreen.stories.tsx`

Expected: both PASS.

- [ ] **Step 6: Commit the integrated onboarding experience**

```bash
git add frontend/src/app/onboarding/_components/OnboardingScreen.tsx frontend/src/lib/onboarding/onboarding.ts frontend/src/lib/onboarding/onboarding.test.ts frontend/src/app/_components/BrandSplashScreen.tsx frontend/src/app/_components/BrandLoadingScreen.stories.tsx
git commit -m "feat: connect splash to onboarding completion"
```

---

### Task 5: Align loading UI and verify the complete feature

**Files:**
- Modify: `frontend/src/app/onboarding/loading.tsx`

**Interfaces:**
- Consumes: final onboarding layout from Tasks 3 and 4
- Produces: loading UI with matching visual footprint and final verified feature

- [ ] **Step 1: Update the loading skeleton to match the guide layout**

Render one large rounded visual placeholder, two text lines, four small indicator circles, and one large bottom action placeholder. Keep `aria-busy="true"` and the single `온보딩 화면을 불러오는 중` status announcement.

- [ ] **Step 2: Run all frontend unit tests**

Run: `pnpm --dir frontend test:unit`

Expected: all tests PASS.

- [ ] **Step 3: Run all Storybook interaction tests**

Run: `pnpm --dir frontend exec vitest --project storybook --run`

Expected: all stories PASS; existing unrelated warnings are recorded separately.

- [ ] **Step 4: Run lint and production build**

Run: `pnpm --dir frontend lint`

Run: `pnpm --dir frontend build`

Expected: both exit with status 0.

- [ ] **Step 5: Check responsive layout and interaction in a real browser**

Start: `pnpm --dir frontend dev`

At `/onboarding`, verify 320px, 390px, and 480px widths; no horizontal overflow; splash has no control; next/previous, arrow keys, swipe, focus movement, and the final home navigation work. Clear `sopum_onboarding_completed` before repeating the first-visit flow.

- [ ] **Step 6: Check scope and whitespace**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors and no new unrelated files. Preserve the pre-existing home-route and loading-screen changes already owned by the user.

- [ ] **Step 7: Commit the verification slice**

```bash
git add frontend/src/app/onboarding/loading.tsx
git commit -m "feat: polish onboarding loading and motion"
```
