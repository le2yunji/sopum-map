# Textarea Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement issue #62 as a controlled, accessible Textarea with feedback and character-count states.

**Architecture:** Keep the native `<textarea>` as the behavior boundary and wrap it with one focused component that owns label and description ID wiring. Native attributes provide length, disabled, and read-only behavior; Storybook browser tests verify consumer-visible behavior.

**Tech Stack:** React 19, TypeScript strict mode, Tailwind CSS 4, Storybook 10, Vitest browser mode, Playwright Chromium

## Global Constraints

- Keep `value` and `onChange` controlled and forward the textarea ref.
- Use existing color and typography tokens without adding dependencies.
- Prefer `errorMessage` over `helperText` and connect visible feedback through `aria-describedby`.
- Use polite Korean for every user-facing example.
- Verify 320px, 390px, and 480px layouts with no horizontal overflow.
- Add a short purpose comment above every new function.

---

### Task 1: Accessible controlled field

**Files:**
- Create: `frontend/src/components/ui/Textarea/Textarea.tsx`
- Create: `frontend/src/components/ui/Textarea/Textarea.types.ts`
- Create: `frontend/src/components/ui/Textarea/Textarea.stories.tsx`
- Create: `frontend/src/components/ui/Textarea/index.ts`

**Interfaces:**
- Consumes: native `TextareaHTMLAttributes<HTMLTextAreaElement>` and project design tokens.
- Produces: `Textarea`, `TextareaProps`, controlled value updates, label and feedback accessibility wiring.

- [x] **Step 1: Write the failing controlled-field story**

Create a `Controlled` story whose render function owns `useState("")`. Its play function clicks the visible label, checks textarea focus, types `행운을 발견했어요`, and expects both the textarea value and a `9 / 20` character count.

- [x] **Step 2: Run the story and verify RED**

Run:

```bash
pnpm --dir frontend exec vitest --project storybook --run src/components/ui/Textarea/Textarea.stories.tsx
```

Expected: FAIL because `Textarea` does not exist.

- [x] **Step 3: Implement the typed field**

Define the public type as:

```tsx
export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "className"
> &
  Readonly<{
    value: string;
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
    label?: string;
    helperText?: string;
    errorMessage?: string;
    showCharacterCount?: boolean;
    className?: string;
    textareaClassName?: string;
  }>;
```

Use `forwardRef`, `useId`, a real `<label>`, a `resize-none` textarea, and derived helper/error/count rows. Merge a consumer-provided `aria-describedby` with the generated feedback ID.

- [x] **Step 4: Run the focused story and verify GREEN**

Run the command from Step 2. Expected: the controlled story passes.

- [x] **Step 5: Commit the accessible field slice**

```bash
git add frontend/src/components/ui/Textarea
git commit -m "Feat: Textarea 제어 입력과 접근성 구현"
```

---

### Task 2: Feedback and native states

**Files:**
- Modify: `frontend/src/components/ui/Textarea/Textarea.stories.tsx`
- Modify: `frontend/src/components/ui/Textarea/Textarea.tsx`

**Interfaces:**
- Consumes: the Task 1 `Textarea` contract.
- Produces: verified helper, error, max length, disabled, read-only, and long-content states.

- [x] **Step 1: Add failing feedback and state stories**

Add stories for `Default`, `WithLabel`, `Placeholder`, `WithValue`, `HelperText`, `Error`, `CharacterCount`, `MaxLengthReached`, `Disabled`, `ReadOnly`, and `LongReview`. Add play assertions that:

- error text is the accessible description and helper text is absent;
- typing beyond `maxLength={5}` keeps the value at five characters;
- disabled and read-only fields do not change after typing.

- [x] **Step 2: Run the stories and verify RED**

Run the focused command from Task 1. Expected: at least one new state assertion fails before its rendering or accessibility behavior exists.

- [x] **Step 3: Implement the minimal missing state behavior**

Apply `aria-invalid`, error border and focus colors, disabled/read-only styling, `maxLength`, and count rendering. Do not add validation rules or internal input state.

- [x] **Step 4: Run the focused stories and lint**

```bash
pnpm --dir frontend exec vitest --project storybook --run src/components/ui/Textarea/Textarea.stories.tsx
pnpm --dir frontend lint -- src/components/ui/Textarea
```

Expected: every Textarea story passes with zero ESLint errors.

- [x] **Step 5: Commit the state coverage slice**

```bash
git add frontend/src/components/ui/Textarea
git commit -m "Test: Textarea 상태별 스토리 추가"
```

---

### Task 3: Full verification and PR

**Files:**
- Modify: `docs/superpowers/plans/2026-08-10-textarea-component.md`

**Interfaces:**
- Consumes: completed Textarea component and stories.
- Produces: verified branch and PR targeting `dev` with `Closes #62`.

- [x] **Step 1: Run full automated verification**

```bash
pnpm --dir packages build
pnpm --dir frontend exec vitest --project storybook --run
pnpm --dir frontend lint
pnpm --dir frontend build
git diff --check dev...HEAD
```

- [x] **Step 2: Inspect responsive browser output**

Open the controlled and error stories in Chromium at 320px, 390px, and 480px. Confirm no horizontal overflow, visible focus/error states, correct count updates, accessible names, and zero console errors.

- [x] **Step 3: Review branch scope**

Confirm `git diff --name-status dev...HEAD` contains only the design, plan, and `frontend/src/components/ui/Textarea/*`.

- [ ] **Step 4: Push and create the PR**

Push `feat/62/textarea` and create a PR to `dev` using the repository template. Include `Closes #62`, verification counts, responsive results, and the controlled-component trade-off.
