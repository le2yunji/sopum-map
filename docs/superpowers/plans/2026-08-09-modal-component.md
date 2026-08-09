# Modal Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement issue #19 as a controlled, accessible native-dialog Modal with composable sections and a Figma-matched example.

**Architecture:** `Modal` owns native `<dialog>` lifecycle, dismissal, scroll locking, and focus restoration. Compound section components own only repeatable spacing and typography, allowing feature content to remain independent from routing and data fetching.

**Tech Stack:** Next.js 16.2.12, React 19.2.4, TypeScript 5 strict mode, Tailwind CSS 4, Storybook 10, Vitest browser mode, Playwright Chromium

## Global Constraints

- Add no third-party overlay dependency.
- Keep Modal independent from Parallel Routes and Intercepting Routes.
- Match Figma node `216:1951`: max width 329px, 20px radius, centered white panel.
- Support 320px–480px mobile layouts and `prefers-reduced-motion`.
- Require an accessible name through `ariaLabel` or `ariaLabelledBy`.
- Restore focus and body overflow state after every close and unmount path.
- User-facing story copy must use polite Korean.
- Add a short purpose comment above every new function.

---

### Task 1: Controlled native dialog lifecycle

**Files:**
- Create: `frontend/src/components/ui/Modal/Modal.tsx`
- Create: `frontend/src/components/ui/Modal/Modal.types.ts`
- Create: `frontend/src/components/ui/Modal/Modal.stories.tsx`

**Interfaces:**
- Produces: `ModalProps` with `open`, `onOpenChange`, `children`, accessible label props, `closeOnBackdrop`, and `className`.
- Produces: `Modal` rendering a native `<dialog>` and exposing `Modal.Header`, `Modal.Title`, `Modal.Body`, and `Modal.Footer`.

- [x] **Step 1: Write the failing closed/open story tests**

Create a controlled story harness and assert observable dialog state:

```tsx
function ModalHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>모달 열기</button>
      <Modal open={open} onOpenChange={setOpen} ariaLabel="알림">
        <p>안내 내용입니다.</p>
      </Modal>
    </>
  );
}

export const Controlled: Story = {
  render: () => <ModalHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("dialog", { name: "알림" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "모달 열기" }));
    await expect(canvas.getByRole("dialog", { name: "알림" })).toBeVisible();
  },
};
```

- [x] **Step 2: Run the focused Storybook test and verify RED**

Run:

```bash
pnpm --dir frontend exec vitest --project storybook --run
```

Expected: FAIL because `./Modal` does not exist.

- [x] **Step 3: Define the public type contract**

```ts
export type ModalProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  closeOnBackdrop?: boolean;
  className?: string;
}>;
```

- [x] **Step 4: Implement the minimal controlled native dialog**

Use a dialog ref and synchronize only when state differs:

```tsx
useEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog) return;

  if (open && !dialog.open) dialog.showModal();
  if (!open && dialog.open) dialog.close();
}, [open]);
```

Render the panel as a child wrapper so backdrop clicks can be distinguished later. Keep the closed dialog in the DOM but invisible through native dialog behavior.

- [x] **Step 5: Run the full Storybook test and verify GREEN**

Run the same Vitest command. Expected: all existing tests and the controlled story pass.

- [x] **Step 6: Commit the lifecycle slice**

```bash
git add frontend/src/components/ui/Modal
git commit -m "Feat: Modal 기본 제어 동작 구현"
```

---

### Task 2: Dismissal, focus restoration, and scroll safety

**Files:**
- Modify: `frontend/src/components/ui/Modal/Modal.tsx`
- Modify: `frontend/src/components/ui/Modal/Modal.stories.tsx`

**Interfaces:**
- Consumes: `ModalProps` and controlled native dialog from Task 1.
- Produces: Escape, backdrop, focus restoration, and body scroll behavior.

- [x] **Step 1: Add failing interaction stories**

Add separate play tests that prove:

```tsx
await userEvent.keyboard("{Escape}");
await expect(dialog).not.toBeVisible();
await expect(trigger).toHaveFocus();
```

For backdrop behavior, click the `<dialog>` element itself and verify close. Click the visible panel text and verify the dialog stays open. Render a `closeOnBackdrop={false}` story and verify a backdrop click keeps it open.

- [x] **Step 2: Run Storybook tests and verify RED**

Expected failures: Escape may visually close without notifying controlled state, focus contract is not explicit, and backdrop close is absent.

- [x] **Step 3: Implement dismissal handlers**

```tsx
const requestClose = () => onOpenChange(false);

const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
  event.preventDefault();
  requestClose();
};

const handleBackdropPointerDown = (event: PointerEvent<HTMLDialogElement>) => {
  if (closeOnBackdrop && event.target === event.currentTarget) requestClose();
};
```

Capture `document.activeElement` before opening and restore it after the controlled close. Store and restore `document.body.style.overflow`; cleanup must run when an open Modal unmounts.

- [x] **Step 4: Run tests and verify GREEN**

Expected: dismissal, panel click, disabled backdrop, and focus restoration tests pass with no console errors.

- [x] **Step 5: Commit the interaction slice**

```bash
git add frontend/src/components/ui/Modal
git commit -m "Feat: Modal 닫기와 포커스 복구 구현"
```

---

### Task 3: Compound sections and Figma example

**Files:**
- Modify: `frontend/src/components/ui/Modal/Modal.tsx`
- Modify: `frontend/src/components/ui/Modal/Modal.stories.tsx`
- Create: `frontend/src/components/ui/Modal/index.ts`

**Interfaces:**
- Consumes: interaction-safe `Modal` from Task 2.
- Produces: `Modal.Header`, `Modal.Title`, `Modal.Body`, `Modal.Footer` and package-local exports.

- [x] **Step 1: Write the failing Figma example story**

Render the approved copy and section API:

```tsx
<Modal open onOpenChange={fn()} ariaLabelledBy="report-complete-title">
  <Modal.Header>
    <span aria-hidden="true">🐿️</span>
    <Modal.Title id="report-complete-title">제보가 완료되었습니다</Modal.Title>
  </Modal.Header>
  <Modal.Body>소중한 제보 감사합니다.<br />더 나은 서비스를 위해 빠르게 확인하겠습니다.</Modal.Body>
  <Modal.Footer><button type="button">닫기</button></Modal.Footer>
</Modal>
```

Assert the named dialog, title, polite description, and close action. The emoji is a story-only stand-in for content supplied by a later feature; the primitive must not embed feature imagery.

- [x] **Step 2: Run Storybook tests and verify RED**

Expected: FAIL because compound section properties do not exist.

- [x] **Step 3: Implement focused section components**

Implement named functions with `ComponentPropsWithoutRef` and assign them to a typed compound component. Apply:

- panel: `w-[calc(100%-2.5rem)] max-w-[329px] rounded-[20px] bg-white p-6`;
- title: centered `text-16 leading-8 text-black-950`;
- body: centered `text-14 leading-[26px] text-black-800`;
- footer: top spacing and full-width action layout;
- backdrop: `backdrop:bg-black-950/45`;
- transitions only under `motion-safe` utilities.

- [x] **Step 4: Run tests and verify GREEN**

Expected: Figma example and all prior interaction stories pass.

- [x] **Step 5: Run frontend lint**

```bash
pnpm --dir frontend lint
```

Expected: zero errors and warnings from changed files.

- [x] **Step 6: Commit the visual API slice**

```bash
git add frontend/src/components/ui/Modal
git commit -m "Feat: Modal 합성 영역과 피그마 예시 추가"
```

---

### Task 4: Verification and issue #19 PR

**Files:**
- Modify: `docs/superpowers/plans/2026-08-09-modal-component.md`

**Interfaces:**
- Consumes: completed Modal component and stories.
- Produces: verified branch and template-based PR targeting `dev` with `Closes #19`.

- [x] **Step 1: Run full automated verification**

```bash
pnpm --dir frontend exec vitest --project storybook --run
pnpm --dir frontend lint
pnpm --dir frontend build
git diff --check
```

Expected: all commands pass. Existing unrelated Storybook LCP warnings may be recorded but must not hide Modal errors.

- [x] **Step 2: Inspect in Chromium**

Open the Modal Figma story at 320px, 390px, and 480px. Verify centered layout, no horizontal overflow, Escape, backdrop close, trigger focus restoration, body scroll lock, accessible name, and clean app console.

- [x] **Step 3: Review branch scope**

```bash
git diff --name-status dev...HEAD
git diff --check dev...HEAD
```

Expected files: the approved design spec, this implementation plan, and `frontend/src/components/ui/Modal/*` only.

- [x] **Step 4: Mark this plan complete and commit**

```bash
git add docs/superpowers/plans/2026-08-09-modal-component.md
git commit -m "Docs: Modal 구현 계획 완료"
```

- [x] **Step 5: Push and create PR**

Push `feat/19/modal` and create a PR targeting `dev` with the repository template, verification results, Figma reference, and `Closes #19`.
