# Backend EC2 Auto Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `main`의 백엔드 빌드 아티팩트를 S3에 올린 뒤 SSM으로 EC2의 PM2 앱까지 자동 배포하고, 실패 시 이전 릴리스로 복구한다.

**Architecture:** GitHub Actions는 빌드·업로드·SSM 실행·결과 수집을 조정하고, 버전 관리되는 Bash 스크립트가 EC2 안의 설치·심볼릭 링크 전환·PM2 재시작·상태 확인·롤백을 담당한다. 배포 스크립트도 커밋별 S3 경로에 업로드해 아티팩트와 실행 로직의 버전을 일치시킨다.

**Tech Stack:** GitHub Actions, AWS CLI v2, AWS S3, AWS Systems Manager Run Command, Bash, PM2 7.1.1, Node.js 24.22.1

**Spec:** `docs/superpowers/specs/2026-11-06-backend-ec2-auto-deploy-design.md`

## Global Constraints

- 기존 `build-and-upload` 품질 게이트와 OIDC 인증을 유지한다.
- 운영 비밀값과 AWS 자격 증명을 저장소나 Actions 로그에 출력하지 않는다.
- EC2 경로는 `/home/ubuntu/sopum-map-deploy`, 공유 환경변수는 `shared/.env`, PM2 앱은 `sopum-api`를 사용한다.
- PM2와 Node는 `/home/ubuntu/.nvm/versions/node/v24.22.1/bin`의 기존 설치를 사용한다.
- 새 런타임 의존성과 AWS CodeDeploy를 추가하지 않는다.
- 사용자의 기존 프론트엔드 미커밋 변경을 수정하거나 커밋에 섞지 않는다.

## Review Focus

- 같은 커밋을 다시 배포할 때 기존 릴리스를 손상시키지 않고 재시작할 수 있어야 한다. Task 1 성공 테스트에 동일 SHA 재실행 검증을 추가한다.
- `current` 링크가 없거나 깨진 첫 배포에서도 새 릴리스로 전환할 수 있어야 한다. Task 1 첫 배포 테스트로 검증한다.
- 상태 확인이 실패하고 이전 링크도 없으면 불완전한 프로세스를 남기지 않고 실패해야 한다. Task 1 실패 테스트로 검증한다.
- SSM 명령이 시간 초과 또는 실패 상태가 되면 Actions 작업도 실패하고 원격 오류를 출력해야 한다. Task 2 워크플로 정적 검증에서 waiter와 실패 시 invocation 조회를 확인한다.
- GitHub 변수나 EC2 공유 `.env`가 누락되면 실행 중인 버전을 건드리기 전에 실패해야 한다. Task 1과 Task 2의 입력 검증 테스트로 확인한다.

---

### Task 1: EC2 릴리스 설치·롤백 스크립트

**Files:**
- Create: `.github/scripts/deploy-backend-ec2.sh`
- Create: `.github/scripts/deploy-backend-ec2.test.sh`

**Interfaces:**
- Consumes: 첫 번째 인자 `DEPLOY_BUCKET`, 두 번째 인자 40자리 `RELEASE_SHA`; EC2 인스턴스 역할; S3 `releases/<sha>/sopum-api.tar.gz`와 체크섬; 공유 `.env`; PM2 앱 `sopum-api`.
- Produces: `/home/ubuntu/sopum-map-deploy/releases/<sha>` 릴리스, 갱신된 `current` 링크, 성공 시 0·실패 및 롤백 시 0이 아닌 종료 코드.

- [ ] **Step 1: 실패하는 셸 통합 테스트 작성**

`.github/scripts/deploy-backend-ec2.test.sh`에 임시 배포 루트, 가짜 `aws`, 가짜 `pm2`, 가짜 `curl`을 사용한 테스트를 작성한다. 다음을 각각 검증한다.

- 정상 아티팩트는 체크섬 검증 뒤 `current`를 새 SHA로 전환하고 `.env` 링크를 만든다.
- 같은 SHA를 다시 실행해도 릴리스가 유지되고 PM2와 상태 확인을 다시 실행한다.
- 잘못된 SHA 형식, 잘못된 체크섬, 공유 `.env` 누락은 기존 `current`를 바꾸지 않는다.
- 새 버전 상태 확인 실패는 기존 `current`를 복구하고 PM2를 다시 시작한다.
- 이전 `current`가 없는 첫 배포의 상태 확인 실패는 실패로 끝나며 깨진 링크를 남기지 않는다.

- [ ] **Step 2: 테스트가 배포 스크립트 부재로 실패하는지 확인**

Run: `bash .github/scripts/deploy-backend-ec2.test.sh`

Expected: FAIL because `.github/scripts/deploy-backend-ec2.sh` does not exist.

- [ ] **Step 3: `deploy-backend-ec2.sh <bucket> <sha>` 구현**

스크립트는 `set -Eeuo pipefail`을 사용하고 다음 경계를 이름 있는 함수로 나눈다.

- `validate_inputs`: 버킷 비어 있음과 SHA 형식 검증
- `download_and_verify_release`: 아티팩트와 체크섬 다운로드 및 해시 비교
- `prepare_release`: 임시 디렉터리 압축 해제, 필수 파일 확인, `.env` 링크, 최종 경로 전환
- `switch_current_release`: 임시 심볼릭 링크를 이용한 `current` 전환
- `restart_api`: `ubuntu`, 기존 Node 경로와 `PM2_HOME=/home/ubuntu/.pm2`로 `pm2 restart sopum-api --update-env`
- `wait_for_health`: 제한된 횟수로 `http://127.0.0.1:4000/api/health` 확인
- `rollback_release`: 이전 링크 복구 후 PM2 재시작

테스트를 위해 배포 루트, 사용자, 바이너리 경로, 상태 확인 횟수와 지연은 환경변수로 덮어쓸 수 있게 하되 운영 기본값은 설계 문서 값을 사용한다.

- [ ] **Step 4: 셸 통합 테스트와 구문 검사 통과 확인**

Run: `bash .github/scripts/deploy-backend-ec2.test.sh && bash -n .github/scripts/deploy-backend-ec2.sh`

Expected: all scenarios print PASS and exit 0.

- [ ] **Step 5: Task 1 변경만 검토**

Run: `git diff -- .github/scripts/deploy-backend-ec2.sh .github/scripts/deploy-backend-ec2.test.sh`

Expected: 운영 기본값에 비밀값이 없고 프론트엔드 파일 변경이 포함되지 않는다.

### Task 2: GitHub Actions SSM 배포 연결

**Files:**
- Modify: `.github/workflows/deploy-backend-ec2.yml`
- Create: `.github/scripts/validate-backend-deploy-workflow.sh`

**Interfaces:**
- Consumes: Task 1의 `.github/scripts/deploy-backend-ec2.sh`; GitHub 변수 `AWS_ROLE_ARN`, `DEPLOY_BUCKET`, `EC2_INSTANCE_ID`; OIDC로 얻은 AWS 자격 증명.
- Produces: 커밋별 S3 배포 스크립트, SSM command ID, 원격 명령 결과와 Actions 성공·실패 상태.

- [ ] **Step 1: 실패하는 워크플로 정적 검증 작성**

`.github/scripts/validate-backend-deploy-workflow.sh`가 YAML 구문을 파싱하고 다음 문자열·구조를 검증하게 한다.

- `EC2_INSTANCE_ID: ${{ vars.EC2_INSTANCE_ID }}`
- 배포 변수 검증에 `EC2_INSTANCE_ID` 포함
- 커밋 S3 경로로 `deploy-backend-ec2.sh` 업로드
- `aws ssm send-command`
- `AWS-RunShellScript`
- `aws ssm wait command-executed`
- 성공과 실패 모두에서 `aws ssm get-command-invocation`

- [ ] **Step 2: 현재 워크플로를 대상으로 실패 확인**

Run: `bash .github/scripts/validate-backend-deploy-workflow.sh`

Expected: FAIL because the workflow does not reference `EC2_INSTANCE_ID` or SSM.

- [ ] **Step 3: 워크플로에 업로드·SSM 실행·대기 단계 구현**

`.github/workflows/deploy-backend-ec2.yml`을 다음처럼 변경한다.

- 워크플로 이름과 concurrency 그룹을 실제 EC2 배포 의미로 변경한다.
- 전역 환경에 `EC2_INSTANCE_ID`를 추가하고 세 배포 변수를 모두 검증한다.
- 아티팩트와 체크섬 옆에 Task 1 배포 스크립트를 업로드한다.
- `jq`로 `AWS-RunShellScript` parameters JSON을 생성해 셸 인용 문제를 피한다.
- `aws ssm send-command`의 command ID를 `GITHUB_OUTPUT`에 저장한다.
- `aws ssm wait command-executed`로 완료를 기다린다.
- waiter 성공 여부와 관계없이 `get-command-invocation` 결과를 로그에 출력하고 실패 상태를 Actions 실패로 전달한다.
- 작업 요약에 커밋, S3 경로, 인스턴스 ID, SSM command ID를 남긴다.

- [ ] **Step 4: 워크플로 정적 검증과 YAML 파싱 통과 확인**

Run: `bash .github/scripts/validate-backend-deploy-workflow.sh`

Expected: PASS and exit 0.

- [ ] **Step 5: Task 2 변경만 검토**

Run: `git diff -- .github/workflows/deploy-backend-ec2.yml .github/scripts/validate-backend-deploy-workflow.sh`

Expected: SSM 명령에 사용자 입력이나 비밀값이 삽입되지 않고 `GITHUB_SHA`와 저장소 변수만 사용한다.

### Task 3: 운영 권한·실행 문서화와 전체 검증

**Files:**
- Create: `docs/backend-ec2-deployment.md`
- Modify: `MEMORY.md`
- Modify: `docs/superpowers/specs/2026-11-06-backend-ec2-auto-deploy-design.md` only if implementation reveals a material design correction

**Interfaces:**
- Consumes: Task 1의 배포 스크립트 인터페이스와 Task 2의 GitHub 변수·SSM 권한 요구사항.
- Produces: GitHub OIDC 역할의 최소 IAM 정책, 첫 배포·실패 진단·수동 재실행·롤백 절차, 저장소의 장기 배포 맥락.

- [ ] **Step 1: 운영 문서 작성**

`docs/backend-ec2-deployment.md`에 다음을 기록한다.

- 현재 S3 경로와 EC2 디렉터리·PM2 구조
- `GitHubActionsSopumMapDeployRole`에 필요한 `ssm:SendCommand`와 `ssm:GetCommandInvocation` 최소 정책 예시
- GitHub 변수 세 개와 EC2 역할의 기존 S3 읽기·SSM Core 전제
- 첫 `workflow_dispatch` 실행, Actions와 PM2 로그 확인 방법
- 상태 확인 실패 시 자동 롤백과 수동으로 이전 SHA를 재배포하는 방법
- 저장소 워크플로는 IAM 정책 자체를 변경하지 않는다는 경계

- [ ] **Step 2: 장기 배포 맥락 갱신**

`MEMORY.md`에 백엔드 `main` 변경은 Actions가 S3 아티팩트를 만들고 SSM으로 단일 EC2의 PM2 `sopum-api`를 자동 배포하며 상태 확인 실패 시 롤백한다는 내용을 추가한다.

- [ ] **Step 3: 전체 정적 검증 실행**

Run: `bash .github/scripts/deploy-backend-ec2.test.sh && bash .github/scripts/validate-backend-deploy-workflow.sh && git diff --check`

Expected: all tests pass and no whitespace errors.

- [ ] **Step 4: 저장소 품질 게이트 실행**

Run: `pnpm --dir packages build && pnpm --dir backend test && pnpm --dir backend build`

Expected: all commands exit 0.

- [ ] **Step 5: 범위와 비밀값 검토**

Run: `git status --short && git diff -- .github docs/backend-ec2-deployment.md MEMORY.md`

Expected: 자동 배포 관련 파일만 새 범위에 포함되고 기존 프론트엔드 미커밋 변경은 그대로 보존된다. 실제 자격 증명, 세션 토큰, MongoDB URI, 애플리케이션 비밀값이 새 변경에 포함되지 않는다.

- [ ] **Step 6: 운영 적용 전 선행 조건 기록**

GitHub OIDC 역할에 문서의 SSM 정책이 적용되기 전에는 실제 `workflow_dispatch`를 실행하지 않는다. 정책 적용 후 첫 실행 결과에서 SSM command 상태, PM2 `sopum-api`, EC2 내부와 외부 `/api/health`를 확인한다.
