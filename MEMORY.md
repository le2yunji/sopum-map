# 소품지도 프로젝트 메모리

> 기준일: 2026-08-10
>
> 기준 브랜치: `dev`
>
> 기준 커밋: `dc626cf`

이 문서는 프로젝트 구조와 구현 상태를 빠르게 파악하기 위한 스냅샷이다. 내용이 실제 코드나 Git 상태와 다르면 실제 상태를 우선하고 이 문서를 갱신한다.

## 제품 목표

사용자가 소품샵, 가챠샵, 굿즈샵을 지도에서 발견하고 좋아요, 방문 기록, 보관 폴더, 코스로 관리할 수 있는 모바일 웹 서비스를 만든다.

## 저장소 구조

```text
sopum-map/
├── frontend/          Next.js 사용자 화면과 Storybook
├── backend/           Express API와 Mongoose 모델
├── packages/shared/   프론트엔드·백엔드 공용 계약
├── docs/superpowers/  승인된 UI 설계와 구현 계획
└── .agents/skills/    저장소 전용 에이전트 작업 맥락
```

세 패키지는 `pnpm` 워크스페이스로 연결한다. `@sopum-map/shared`는 프론트엔드와 백엔드가 함께 사용한다.

## 프론트엔드

### 기술 스택

- Next.js 16.2.12 App Router
- React 19.2.4
- TypeScript 6
- Tailwind CSS 4
- Storybook 10.5.2
- Vitest 4.1.10과 Playwright 1.61.1

### `dev`에 구현된 내용

- Pretendard 폰트, 색상·타이포그래피 토큰, 최대 480px 모바일 앱 프레임
- 로그인 화면과 네이버·구글·애플·카카오 로그인 버튼 UI
- 첫 방문 시 `/`와 `/login` 요청을 브랜드 온보딩 화면으로 보내는 쿠키 기반 흐름
- 브랜드 로딩 화면과 라우트별 로딩·오류 UI
- 홈 화면의 오늘의 큐레이션, 카테고리별 상점, 추천 코스와 로딩·빈 상태·오류 상태
- 네이버 지도 캔버스, 검색, 카테고리·태그 필터, 마커와 주변 상점 목록
- 홈·지도·내 픽·마이페이지로 이동하는 하단 내비게이션
- `Badge`, `Button`, `SearchInput`, `FilterChipGroup`, `Skeleton` 공용 컴포넌트
- `ShopCard`, `ShopBannerCarousel`, `CourseListItem` 도메인 UI 컴포넌트
- Storybook foundation과 주요 화면·컴포넌트 스토리
- 공통 API `fetcher`

### 연결 전 또는 미완성 상태

- 홈과 지도는 fixture 임시 데이터를 사용하며 상점 API와 연결되지 않았다.
- 네이버 지도는 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 환경변수가 필요하다.
- `/picks`와 `/me` 링크는 하단 내비게이션에 있지만 대응 페이지가 없다.
- 상점 상세 페이지는 복구 동선만 제공하는 임시 화면이다.
- 로그인 버튼은 UI만 있고 실제 소셜 인증 흐름은 없다.
- 좋아요, 방문 기록, 보관 폴더, 코스 관리 UI와 API 연결이 없다.
- 화면별 실제 네트워크 로딩·실패 처리와 섹션 단위 오류 격리는 API 연결 때 추가해야 한다.

### 진행 중인 UI 작업

- PR #87 `feat/19/modal` → `dev`: 접근 가능한 native `<dialog>` 기반 Modal 구현과 Storybook 검증이 끝났고 현재 열려 있다.
- `feat/20/bottom-sheet`: Modal 브랜치를 바탕으로 BottomSheet와 공통 overlay 동작을 구현 중이다. 2026-08-09 기준 해당 워크트리에 미커밋 변경이 있으므로 보존해야 한다.
- `feat/33/picks-ui`: 전용 워크트리는 있으나 `dev` 이후 구현 커밋이 없다.
- 이미 병합된 `feat/21/onboarding-ui`, `feat/68/home-ui`, `feat/30/map-ui`, `feat/first-visit-onboarding-impl` 워크트리가 남아 있다. 새 작업의 기준은 각 오래된 워크트리가 아니라 최신 `dev`다.

## 백엔드

### 기술 스택

- Node.js 20 실행 환경
- Express 5.2.1
- TypeScript 6
- MongoDB와 Mongoose 9.7.3
- Zod 4.4.3
- Vitest 4.1.10과 Supertest 7.2.2

### 구현된 내용

- MongoDB 연결과 환경변수 검증
- CORS, JSON 파싱, `/api/health` 상태 확인 API
- 공통 성공·오류 응답과 오류 미들웨어
- `GET /api/shops` 상점 목록 조회와 페이지네이션·검색·카테고리·태그 검증
- `GET /api/shops/:shopId` 상점 상세 조회
- 상점 쿼리 빌더, 매퍼, 서비스와 검증 테스트
- `User`, `Shop`, `Tag`, `Like`, `VisitLog` 모델
- `PickFolder`, `PickFolderItem`, `Course`, `CourseSave`, `ShopSuggestion` 모델과 시드 파일

### 연결 전 또는 미완성 상태

- 인증·인가와 선택적 사용자 인증 미들웨어가 없다.
- 상점 응답의 사용자별 `isLiked` 계산은 연결 전이다.
- 좋아요, 방문 기록, 보관 폴더, 코스 API가 없다.
- 프론트엔드 화면은 상점 API를 아직 소비하지 않는다.

## 공용 패키지

- 패키지 이름은 `@sopum-map/shared`다.
- API 성공·오류 응답과 상점 목록·상세·태그 계약을 제공한다.
- 태그, 코스, 상점 카테고리와 상태 상수를 관리한다.
- 실제 소스 위치는 `packages/shared/`, 패키지 진입점과 빌드 설정은 `packages/`에 있다.

## UI 작업을 이어갈 때

1. `git status --short --branch`와 `git worktree list`로 사용자 변경을 먼저 구분한다.
2. `frontend/AGENTS.md`와 관련 `docs/superpowers/specs/`, `docs/superpowers/plans/`를 읽는다.
3. Next.js 코드를 바꾸기 전에 `frontend/node_modules/next/dist/docs/`의 현재 버전 문서를 확인한다.
4. 기존 토큰과 공용 컴포넌트를 우선 사용하고 320px·390px·480px에서 확인한다.
5. 정상·로딩·빈 상태·오류 상태와 키보드·포커스 동작을 Storybook 또는 테스트로 검증한다.

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

## 확인이 필요한 점

- 루트 `README.md`가 비어 있어 설치, 환경변수, 실행 순서가 문서화되지 않았다.
- 상점 상세 임시 화면에는 존댓말 규칙과 맞지 않는 문구가 남아 있다.
- `packages/dist/`에 과거 출력 경로와 현재 `src/` 출력이 함께 있어 빌드 산출물 정책을 별도 확인해야 한다.
- 남아 있는 여러 워크트리는 사용자 작업을 확인한 뒤 정리해야 하며 임의로 삭제하지 않는다.
