# Modal and BottomSheet Component Design

## Goal

Build reusable, accessible `Modal` and `BottomSheet` primitives that match the existing Figma design and remain independent from Next.js routing. Route-driven overlays can wrap these primitives later without changing their public interface.

## Scope and delivery order

The work is split into two independent PRs.

1. Issue #19: implement `Modal` on `feat/19/modal` from `dev`.
2. Issue #20: implement `BottomSheet` on a stacked branch based on the Modal branch.

Parallel Routes and Intercepting Routes are outside these component PRs. They belong to page-level flows that need shareable URLs, refresh behavior, and browser back/forward integration.

## Design source

- Figma file: `iOGJvdSmjw9iNOIjMWYYBX`
- Modal reference: node `216:1951`, “상점 상세: 제보완료 모달”
- BottomSheet reference: node `216:1909`, “상점 상세: 제보 바텀시트”

The components use the project’s Pretendard font, existing color tokens, Tailwind utilities, and 320px–480px mobile app frame.

## Architecture

Both components use the native HTML `<dialog>` top layer. No overlay library is added. Each component owns only overlay behavior and visual structure; feature content and server data remain children supplied by consumers.

The native dialog provides modal semantics and background interaction blocking. The components add controlled React state synchronization, focus restoration, backdrop handling, scroll locking, and project styling.

## Modal contract

```tsx
type ModalProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  closeOnBackdrop?: boolean;
  className?: string;
}>;
```

Usage is composition-first:

```tsx
<Modal open={open} onOpenChange={setOpen} ariaLabelledBy="report-title">
  <Modal.Header>
    <Modal.Title id="report-title">제보가 완료되었습니다</Modal.Title>
  </Modal.Header>
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>...</Modal.Footer>
</Modal>
```

The compound parts provide consistent spacing without forcing a fixed content schema. Consumers may also pass plain children when the standard sections do not fit.

### Modal visual rules

- Centered within the viewport.
- Width: `calc(100% - 40px)`, maximum 329px.
- White background and 20px corner radius.
- Internal padding follows a 24px base.
- Backdrop uses a subdued black overlay.
- The example footer button is 284px maximum width and uses the project neutral surface.

## BottomSheet contract

`BottomSheet` follows the same controlled state and labeling contract as `Modal`.

```tsx
<BottomSheet open={open} onOpenChange={setOpen} ariaLabelledBy="report-sheet-title">
  <BottomSheet.Handle />
  <BottomSheet.Header>
    <BottomSheet.Title id="report-sheet-title">제보 내용</BottomSheet.Title>
  </BottomSheet.Header>
  <BottomSheet.Body>...</BottomSheet.Body>
  <BottomSheet.Footer>...</BottomSheet.Footer>
</BottomSheet>
```

### BottomSheet visual rules

- Anchored to the bottom edge of the viewport.
- Full mobile app width, maximum 480px.
- White background and 20px top corners.
- 24px internal spacing with bottom safe-area padding.
- Decorative handle: 48px × 6px, neutral gray, pill shape.
- Content can scroll within the sheet when it exceeds the available viewport height.
- Drag-to-dismiss is excluded from the first version. Escape, backdrop, and explicit buttons provide dismissal.

## Interaction and accessibility

- `open=true` calls `showModal()` only when the dialog is not already open.
- `open=false` closes the dialog only when it is open.
- The native `cancel` event handles Escape and calls `onOpenChange(false)`.
- Clicking the backdrop closes the overlay when `closeOnBackdrop` is enabled. Clicking the panel does not close it.
- Closing restores focus to the element that was focused before opening.
- While open, document body scrolling is locked and restored without overwriting a previous inline overflow value.
- Every instance must provide either `ariaLabel` or `ariaLabelledBy`.
- The component never relies on color alone for state or action meaning.
- User-facing example copy is written in polite Korean.
- Motion is limited to a short opacity/transform transition and respects `prefers-reduced-motion`.

## Error and edge handling

- Repeated `open` updates must not call `showModal()` twice.
- Unmounting an open overlay restores body scrolling.
- Nested overlays are not supported in the first version; feature flows should close one overlay before opening another.
- Empty content is allowed at the primitive level but example stories always provide an accessible name.
- Server-rendered output does not access `document` or `window`; browser APIs run only in effects or event handlers.

## Testing

Each component receives Storybook browser tests covering:

- closed state renders no visible dialog;
- opening exposes a named modal dialog;
- Escape calls `onOpenChange(false)`;
- backdrop click closes when enabled;
- panel click does not close;
- backdrop close can be disabled;
- focus returns to the trigger after close;
- Figma example renders with the expected title, body, and action;
- narrow 320px and maximum 480px layouts do not overflow.

The final verification for each PR includes the full Storybook Vitest project, frontend lint, frontend production build, `git diff --check`, and Chromium inspection at 320px, 390px, and 480px.

## Out of scope

- Parallel Route and Intercepting Route directory structures.
- Feature-specific API calls, forms, confirmation logic, or mutations.
- Drag gestures and velocity-based dismissal.
- Multiple simultaneous or nested dialogs.
- A global overlay state store.
