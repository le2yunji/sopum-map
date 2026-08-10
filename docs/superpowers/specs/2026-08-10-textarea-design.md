# Textarea Component Design

## Goal

후기 작성과 제보 화면에서 재사용할 수 있는 제어형 `Textarea`를 만든다. label, 도움말, 오류, 글자 수와 비활성 상태를 한 필드 경계에서 접근 가능하게 연결한다.

## Chosen approach

단일 `Textarea` 컴포넌트가 native `<textarea>`와 주변 메타데이터를 함께 렌더링한다.

검토한 대안은 다음과 같다.

1. `Textarea.Label`, `Textarea.Message` 같은 합성 API는 배치 자유도가 높지만 단순 입력 필드에 사용 코드가 길고 접근성 연결을 소비자가 반복해야 한다.
2. 범용 `FormField`를 먼저 추출하면 Input에도 재사용할 수 있지만 #62 밖의 기존 컴포넌트 구조까지 바꾸게 된다.
3. 선택한 단일 컴포넌트 방식은 이슈의 Props와 직접 대응하고 label·메시지 ID 연결을 내부에서 보장한다.

## Public interface

```tsx
type TextareaProps = Omit<
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

`maxLength`, `placeholder`, `disabled`, `readOnly`, `required`, `name`과 `id`는 native 속성을 그대로 사용한다. `forwardRef`로 실제 textarea에 접근할 수 있게 한다.

## Rendering and state

- `label`이 있으면 `<label>`을 렌더링하고 제공된 `id` 또는 `useId()`로 textarea와 연결한다.
- `errorMessage`가 있으면 `helperText` 대신 오류만 표시하고 `aria-invalid=true`를 설정한다.
- 표시되는 도움말 또는 오류의 ID를 기존 `aria-describedby`와 함께 textarea에 연결한다.
- `showCharacterCount`가 켜지면 현재 `value.length`를 표시한다. `maxLength`가 있으면 `현재 / 최대` 형식을 사용한다.
- 브라우저의 native `maxLength`, `disabled`, `readOnly` 동작을 유지한다.
- 입력 영역은 `resize-none`과 최소 높이를 사용해 모바일 레이아웃을 지킨다.

## Visual rules

- 기본 테두리는 `black-300`, 포커스는 `green-500`, 오류는 `red-600` 토큰을 사용한다.
- label은 본문보다 굵게, 도움말과 글자 수는 보조 색으로 표시한다.
- 오류 메시지는 색상뿐 아니라 텍스트와 `aria-invalid`로도 전달한다.
- 컨테이너는 전체 너비를 사용하며 320px·390px·480px에서 가로 넘침이 없어야 한다.

## Testing

Storybook 브라우저 테스트로 다음 계약을 확인한다.

- label을 눌렀을 때 textarea에 포커스가 이동한다.
- 입력하면 부모의 제어 값과 글자 수가 함께 갱신된다.
- `maxLength`를 넘는 입력은 native 동작으로 제한된다.
- 오류가 도움말보다 우선하고 textarea의 접근 가능한 설명이 된다.
- disabled와 readOnly 상태에서 값이 바뀌지 않는다.

스토리는 기본, label, placeholder, 입력값, 도움말, 오류, 글자 수, 최대 글자 수 도달, disabled, readOnly, 긴 후기 상태를 제공한다.

## Out of scope

- 별점, 이미지 첨부, 제출 버튼과 폼 유효성 정책
- 자동 높이 조절과 마크다운 편집
- 기존 SearchInput이나 범용 FormField 리팩터링
