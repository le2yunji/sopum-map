# BottomSheet Component Implementation Plan

**Goal:** Implement issue #20 as a controlled, accessible mobile BottomSheet matching Figma node `216:1909`.

**Architecture:** Reuse a small internal native-dialog controller shared with Modal. BottomSheet owns only its bottom placement, section layout, and optional close control. Feature content and routing stay outside the primitive.

**Tech Stack:** Next.js 16, React 19, TypeScript strict mode, Tailwind CSS 4, Storybook 10, Vitest browser mode, Playwright Chromium

## Constraints

- Add no overlay dependency and keep the component independent from routing.
- Require `ariaLabel` or `ariaLabelledBy`.
- Support ESC, backdrop close, body scroll lock, focus restoration, and unmount cleanup.
- Support a visible close button when `showCloseButton` is enabled.
- Keep drag-to-dismiss out of v1 because reliable pointer, velocity, and nested-scroll behavior needs a separate interaction scope.
- Respect the bottom safe area and 320px–480px widths.
- Use polite Korean for every user-facing example.
- Add a short purpose comment above every new function.

## Task 1: Shared dialog behavior

- [x] Add failing BottomSheet open/close, ESC, backdrop, and focus stories.
- [x] Verify RED because the component does not exist.
- [x] Extract Modal's native dialog lifecycle into a package-internal hook without changing Modal behavior.
- [x] Implement the minimal BottomSheet root and verify GREEN.
- [x] Commit the behavior slice.

## Task 2: Composable Figma layout

- [x] Add a failing report-sheet story using `BottomSheet.Header`, `Title`, `Body`, and `Footer`.
- [x] Implement compound sections, safe-area padding, dimmed backdrop, and optional close button.
- [x] Match Figma node `216:1909` and verify the example copy is polite Korean.
- [x] Commit the visual API slice.

## Task 3: Verification and PR

- [x] Run the full Storybook suite, lint, production build, and `git diff --check`.
- [x] Inspect 320px, 390px, and 480px in Chromium with no overflow or console errors.
- [x] Review the diff against `feat/19/modal` and exclude unrelated files.
- [ ] Push `feat/20/bottom-sheet` and create a separate stacked PR with `Closes #20`.
