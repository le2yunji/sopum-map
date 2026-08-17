# 소품지도 프로젝트 메모리

이 문서는 저장소를 처음 볼 때 필요한 **오래 유지되는 맥락**만 기록한다. 실제 코드, 패키지 설정, Git 상태와 다르면 실제 상태를 우선한다.

개별 화면의 완료 여부, 이슈·PR 번호, 작업 브랜치, 기준 커밋, 임시 fixture와 세부 UI 상태는 기록하지 않는다. 이런 정보는 코드와 GitHub에서 확인한다.

## 제품 목표

사용자가 소품샵, 가챠샵, 굿즈샵을 발견하고 좋아요, 방문 기록, 보관 폴더와 코스로 관리하는 모바일 웹 서비스를 만든다.

## 저장소 구조

```text
sopum-map/
├── frontend/          Next.js 사용자 화면과 Storybook
├── backend/           Express API와 Mongoose 모델
├── packages/shared/   프론트엔드·백엔드 공용 계약
└── .agents/skills/    저장소 전용 에이전트 작업 맥락
```

세 패키지는 `pnpm` 워크스페이스로 연결한다. 프론트엔드와 백엔드는 `@sopum-map/shared`를 통해 공용 타입과 상수를 사용한다.

## 기술과 구조

### 프론트엔드

- Next.js App Router와 React를 사용한다.
- TypeScript 6, Tailwind CSS 4를 사용한다.
- Storybook, Vitest, Playwright로 컴포넌트 상태와 상호작용을 검증한다.
- 모바일 우선이며 앱 영역의 최대 너비는 480px다.
- 공용 UI는 `frontend/src/components/`에 두고 화면에서 먼저 재사용한다.
- 지도 기능은 네이버 지도 클라이언트 환경변수가 필요하다.
- 서버 API가 연결되지 않은 화면은 fixture 또는 로컬 상태를 사용할 수 있으므로, 작업 전에 데이터 출처를 코드에서 확인한다.

### 백엔드

- Express, MongoDB, Mongoose를 사용한다.
- TypeScript 6과 Zod를 사용한다.
- 요청 흐름은 라우터 → 컨트롤러 → 서비스 → 모델 순서로 나눈다.
- 공통 성공·오류 응답 형식을 사용한다.
- 상점 조회 API가 구현되어 있으며, 인증과 사용자별 기능 API는 코드를 기준으로 연결 여부를 확인한다.

### 공용 패키지

- 패키지 이름은 `@sopum-map/shared`다.
- `packages/shared/src/`에서 `shop`, `tag`, `course`, `api`처럼 도메인별로 관리한다.
- 프론트엔드와 백엔드가 함께 쓰는 API 계약, 타입과 상수만 둔다.
- 각 도메인의 `index.ts`와 최상위 `src/index.ts`를 통해 공개 항목을 내보낸다.

## 유지되는 제품·UI 원칙

- 공용 Modal 컴포넌트는 사용하지 않는다.
- 선택과 추가 입력은 `BottomSheet`를 우선 사용한다.
- 단순 안내와 작업 결과는 페이지 안 상태 UI나 가벼운 피드백 컴포넌트로 표현한다.
- 기존 디자인 토큰과 공용 UI 컴포넌트를 새 요소보다 먼저 검토한다.
- 정상·로딩·빈 상태·오류 상태와 키보드·포커스 동작을 함께 고려한다.

## 작업할 때 확인할 곳

1. 루트 `AGENTS.md`와 작업 경로에서 가장 가까운 `AGENTS.md`
2. 실제 `package.json`, `pnpm-lock.yaml`, `tsconfig.json`
3. 관련 소스, 타입, 테스트와 Storybook 스토리
4. 현재 Git 브랜치·작업 트리와 GitHub 이슈·PR
5. Next.js 작업이면 설치된 패키지의 `frontend/node_modules/next/dist/docs/`

## MEMORY 갱신 기준

다음처럼 오래 유지되는 맥락이 달라질 때만 이 문서를 갱신한다.

- 패키지나 최상위 디렉터리 구조 변경
- 프레임워크, 언어 버전 계열, 데이터베이스 같은 핵심 기술 변경
- 프론트엔드·백엔드·공용 패키지의 책임 경계 변경
- Modal 미사용처럼 여러 기능에 적용되는 제품·UI 원칙 변경
- 모든 작업자가 알아야 하는 실행 또는 검증 방식 변경

개별 기능, 화면 문구, 컴포넌트 세부 구현, 이슈·PR 상태가 바뀐 경우에는 갱신하지 않는다.

## 주요 검증 명령

```bash
pnpm --dir frontend test:unit
pnpm --dir frontend exec vitest --project storybook --run
pnpm --dir frontend lint
pnpm --dir frontend build
pnpm --dir backend test
pnpm --dir backend build
pnpm --dir packages build
git diff --check
```
