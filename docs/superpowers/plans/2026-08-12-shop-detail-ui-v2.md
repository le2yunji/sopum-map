# 상점 상세 UI v2 구현 계획

**목표:** Figma 상점 상세 화면을 최신 `dev` 기준으로 새로 구현하고 Modal 없는 제보 완료 흐름을 제공한다.

**구조:** 동적 라우트는 서버 경계로 유지한다. 화면 fixture와 표시 타입은 라우트 가까이에 두고, 상호작용이 필요한 화면만 클라이언트 컴포넌트로 만든다.

**기술:** Next.js 16.2.12, React 19.2.4, TypeScript 6.0.3, Tailwind CSS 4, Storybook 10.5.4

## 작업 1: 화면 계약과 기본 상태

- [x] `ShopDetailScreen`의 성공·로딩·빈 상태·오류 상태 Storybook 테스트 작성
- [x] 테스트가 모듈 부재로 실패하는지 확인
- [x] 표시 타입과 fixture 작성
- [x] Figma 순서의 정보 화면 구현
- [x] 집중 Storybook 테스트 통과 확인

## 작업 2: 사용자 상호작용

- [x] 좋아요, 이미지 이동, 내 픽 선택, 제보 완료 테스트 작성
- [x] 빠진 상호작용 때문에 실패하는지 확인
- [x] 로컬 상태와 두 BottomSheet 흐름 구현
- [x] 제보 완료를 같은 BottomSheet의 `role="status"` 단계로 구현
- [x] 집중 Storybook 테스트 통과 확인

## 작업 3: 라우트 방어 경계

- [x] 동적 `params`를 비동기로 읽는 페이지 연결
- [x] 최종 레이아웃과 비슷한 `loading.tsx` 작성
- [x] 복구 가능한 `error.tsx` 작성

## 작업 4: 검증과 문서 동기화

- [x] 전체 Storybook 테스트, 린트, 공용 패키지 빌드와 프론트 빌드 실행
- [x] 320px·390px·480px와 키보드·포커스·콘솔 확인
- [x] `git diff --check`와 변경 파일 범위 확인
- [x] `MEMORY.md`의 상점 상세 구현 상태 갱신
