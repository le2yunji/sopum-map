# Visit Log UI Implementation Plan

**Goal:** Implement issue #39 as an accessible, fixture-backed mobile review form with local image previews and clear validation.

**Architecture:** Keep the dynamic route thin. A client `VisitLogFormScreen` owns draft state and browser-only previews. Use native date and file inputs plus the shared Textarea, Badge, and Button components. No upload or API request is included.

- [x] Add failing success, validation, loading, and error stories.
- [x] Implement shop summary, visit date, tags, review, file previews, cancel, and submit UI.
- [x] Connect `/shops/[shopId]/reviews/new` with loading and error boundaries.
- [x] Verify Storybook, lint, shared build, frontend build, mobile widths, and focus behavior.
- [ ] Push and open a stacked PR with `Closes #39`.
