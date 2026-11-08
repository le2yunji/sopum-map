# 백엔드 EC2 자동 배포 설계

## 의도

`main`에 백엔드 변경이 병합되면 GitHub Actions가 빌드 산출물을 S3에 보관하는 데서 끝나지 않고, AWS Systems Manager(SSM)를 통해 운영 EC2의 PM2 프로세스까지 자동으로 갱신한다. 사람이 SSH로 접속해 파일을 설치하거나 프로세스를 재시작하지 않아도 배포 성공 여부를 GitHub Actions에서 확인할 수 있어야 한다.

## 목표

- 현재 빌드·테스트·S3 업로드 단계를 유지한다.
- S3에 버전이 고정된 배포 스크립트를 아티팩트와 함께 올린다.
- SSM Run Command로 지정 EC2에서 배포 스크립트를 실행한다.
- 아티팩트 체크섬, 필수 파일, 공유 환경변수 파일을 전환 전에 검증한다.
- `/home/ubuntu/sopum-map-deploy/current` 심볼릭 링크를 새 릴리스로 전환한다.
- PM2 앱 `sopum-api`를 재시작하고 `/api/health`를 확인한다.
- 재시작 또는 상태 확인이 실패하면 이전 심볼릭 링크와 PM2 프로세스로 자동 복구한다.
- SSM 명령의 성공·실패와 출력을 GitHub Actions 결과에 반영한다.

## 비목표

- AWS CodeDeploy, 새 배포 서비스 또는 새 런타임 의존성을 도입하지 않는다.
- 운영 비밀값을 GitHub Actions나 저장소로 옮기지 않는다.
- 프론트엔드 배포 방식을 변경하지 않는다.
- 오래된 릴리스를 자동 삭제하지 않는다. 보관 정책은 별도 작업으로 다룬다.

## 확인된 운영 구조

- EC2 사용자: `ubuntu`
- Node.js: `/home/ubuntu/.nvm/versions/node/v24.22.1/bin/node`
- PM2: `/home/ubuntu/.nvm/versions/node/v24.22.1/bin/pm2`
- PM2 앱: `sopum-api`, fork 모드
- 배포 루트: `/home/ubuntu/sopum-map-deploy`
- 현재 링크: `/home/ubuntu/sopum-map-deploy/current`
- 릴리스 디렉터리: `/home/ubuntu/sopum-map-deploy/releases/<commit-sha>`
- 공유 환경변수: `/home/ubuntu/sopum-map-deploy/shared/.env`
- 릴리스의 `.env`는 공유 환경변수 파일을 가리키는 심볼릭 링크다.
- EC2 역할에는 SSM Core, 배포 버킷 읽기, 방문 로그 이미지 저장소 정책이 연결되어 있다.
- GitHub 변수에는 `AWS_ROLE_ARN`, `DEPLOY_BUCKET`, `EC2_INSTANCE_ID`가 있다.

## 검토한 접근법

### 1. 워크플로 YAML에 배포 명령을 모두 작성

파일 수는 적지만 YAML, JSON, 셸 인용 규칙이 겹친다. 배포와 롤백 로직을 로컬에서 검사하기 어렵고 변경 비용이 커서 선택하지 않는다.

### 2. 버전 관리되는 배포 스크립트를 S3에 함께 업로드하고 SSM으로 실행

선택한 방식이다. 워크플로는 조정 역할만 맡고, 설치·전환·롤백은 독립적인 셸 스크립트가 맡는다. 배포 스크립트가 커밋별 S3 경로에 저장되므로 아티팩트와 실행 로직의 버전이 항상 일치한다.

### 3. AWS CodeDeploy 도입

수명 주기 훅과 배포 이력 기능은 좋지만 현재 단일 EC2와 기존 S3·SSM 구성에는 서비스와 권한이 과도하게 늘어난다. 필요해질 때 별도 전환한다.

## 배포 흐름

1. GitHub Actions가 공용 패키지와 백엔드를 빌드하고 테스트한다.
2. 프로덕션 아티팩트와 SHA-256 체크섬을 만든다.
3. 아티팩트와 배포 스크립트, 각각의 체크섬을 `s3://<bucket>/releases/<commit-sha>/`에 업로드한다.
4. Actions가 `AWS-RunShellScript` 문서로 대상 EC2에 짧은 부트스트랩 명령을 보낸다.
5. EC2는 같은 커밋 경로에서 배포 스크립트와 체크섬을 임시 디렉터리로 내려받아 검증한 뒤 실행한다.
6. 스크립트는 아티팩트 해시를 비교하고 임시 릴리스 디렉터리에 압축을 푼다.
7. `dist/server.js`, `node_modules`, 공유 `.env`를 확인하고 최종 릴리스 디렉터리를 만든다.
8. 기존 `current` 대상을 기록한 뒤 새 릴리스로 심볼릭 링크를 원자적으로 교체한다.
9. `ubuntu` 사용자의 PM2 홈과 Node 경로를 명시해 `sopum-api`를 재시작한다.
10. 제한된 횟수로 `http://127.0.0.1:4000/api/health`를 확인한다.
11. 성공하면 PM2 상태와 새 릴리스 SHA를 출력한다.
12. 실패하면 이전 링크를 복구하고 PM2를 다시 시작한 뒤 실패로 종료한다.
13. Actions는 SSM 명령이 끝날 때까지 기다리고 표준 출력·오류를 작업 로그와 요약에 남긴다.

## 안전성과 실패 처리

- 배포 입력인 버킷 이름, 커밋 SHA, 인스턴스 ID가 비어 있으면 배포 전에 실패한다.
- 커밋 SHA는 40자리 16진수인지 검증해 경로 삽입을 막는다.
- 배포는 커밋별 새 디렉터리에서 이루어지며 현재 실행 중인 릴리스를 덮어쓰지 않는다.
- 배포 스크립트나 아티팩트 체크섬이 다르거나 필수 파일이 없으면 링크를 바꾸지 않는다.
- 공유 `.env`가 없으면 링크를 바꾸지 않는다.
- PM2 명령은 root가 아닌 `ubuntu` 사용자와 기존 `PM2_HOME`에서 실행한다.
- 상태 확인 실패 시 이전 링크를 복구하고 이전 버전을 재시작한다.
- 동시 배포는 기존 GitHub Actions `concurrency` 그룹으로 직렬화한다.
- 로그에는 환경변수 값과 AWS 자격 증명을 출력하지 않는다.

## 필요한 권한

GitHub Actions가 사용하는 `GitHubActionsSopumMapDeployRole`에 다음 권한이 추가로 필요하다.

- 대상 EC2와 `AWS-RunShellScript` 문서에 대한 `ssm:SendCommand`
- 실행 결과 확인을 위한 `ssm:GetCommandInvocation`

EC2 역할은 현재의 SSM Core 권한과 배포 버킷 `releases/*` 읽기 권한을 유지한다. IAM 변경은 저장소 밖의 운영 설정이므로 워크플로에서 자동 변경하지 않고, 필요한 최소 정책을 문서에 남긴다.

## 검증

- 배포 스크립트에 `bash -n` 구문 검사를 실행한다.
- 워크플로 YAML을 파싱해 필수 단계와 변수 참조를 검사한다.
- 가능한 셸 로직은 임시 디렉터리와 가짜 PM2·curl 명령으로 성공, 체크섬 실패, 상태 확인 실패·롤백을 검증한다.
- `git diff --check`로 공백 오류를 확인한다.
- 실제 배포는 `workflow_dispatch`로 먼저 실행하고, GitHub Actions 로그·EC2 PM2 상태·운영 `/api/health`를 확인한다.

## 운영 전환

첫 자동 배포 전에 GitHub OIDC 역할에 SSM 권한을 추가한다. 기존 수동 PM2 프로세스는 그대로 두고 자동 배포가 같은 `sopum-api` 앱을 재시작하게 한다. 첫 실행이 성공하면 이후 `main`의 백엔드 변경은 같은 흐름으로 자동 배포한다.
