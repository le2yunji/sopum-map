# 백엔드 EC2 자동 배포 운영 가이드

`main`의 백엔드 관련 파일이 바뀌면 `Deploy Backend to EC2` GitHub Actions가 빌드, S3 업로드, EC2 설치와 PM2 재시작까지 수행한다. 운영 서버에서 매번 `aws login`이나 SSH 배포를 할 필요는 없다.

## 배포 구조

- AWS 리전: `ap-northeast-2`
- S3: `s3://<DEPLOY_BUCKET>/releases/<commit-sha>/`
- EC2 배포 루트: `/home/ubuntu/sopum-map-deploy`
- 릴리스: `/home/ubuntu/sopum-map-deploy/releases/<commit-sha>`
- 현재 릴리스: `/home/ubuntu/sopum-map-deploy/current`
- 공유 환경변수: `/home/ubuntu/sopum-map-deploy/shared/.env`
- PM2 앱: `sopum-api`
- 내부 상태 확인: `http://127.0.0.1:4000/api/health`

아티팩트와 EC2 배포 스크립트는 각각 SHA-256 체크섬을 확인한다. 새 버전의 상태 확인이 실패하면 `current`를 이전 릴리스로 되돌리고 PM2도 다시 시작한다.

## 한 번만 설정할 항목

GitHub 저장소의 Actions variables에 다음 세 값을 둔다.

```text
AWS_ROLE_ARN=arn:aws:iam::684304643445:role/GitHubActionsSopumMapDeployRole
DEPLOY_BUCKET=sopum-map-deploy-684304643445-ap-northeast-2-an
EC2_INSTANCE_ID=i-02f657a1399d6f974
```

EC2 인스턴스 역할에는 다음 권한이 계속 필요하다.

- `AmazonSSMManagedInstanceCore`
- 배포 버킷의 `releases/*` 객체 읽기

GitHub OIDC 역할에는 기존 S3 업로드 권한 외에 아래 정책을 추가한다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SendBackendDeployCommand",
      "Effect": "Allow",
      "Action": "ssm:SendCommand",
      "Resource": [
        "arn:aws:ec2:ap-northeast-2:684304643445:instance/i-02f657a1399d6f974",
        "arn:aws:ssm:ap-northeast-2::document/AWS-RunShellScript"
      ]
    },
    {
      "Sid": "ReadBackendDeployCommandResult",
      "Effect": "Allow",
      "Action": "ssm:GetCommandInvocation",
      "Resource": "*"
    }
  ]
}
```

저장소의 워크플로는 IAM 정책을 만들거나 바꾸지 않는다. 위 정책은 AWS IAM 콘솔이나 별도 인프라 관리 절차로 적용해야 한다.

## 첫 실행

1. GitHub의 `Actions`에서 `Deploy Backend to EC2`를 연다.
2. `Run workflow`를 눌러 `main`에서 실행한다.
3. `Deploy release with AWS Systems Manager` 단계에서 SSM command ID와 원격 출력이 보이는지 확인한다.
4. EC2에서 아래 명령으로 실제 릴리스와 PM2 상태를 확인한다.

```bash
readlink -f /home/ubuntu/sopum-map-deploy/current
pm2 list
pm2 logs sopum-api --lines 100
curl --fail http://127.0.0.1:4000/api/health
```

마지막으로 배포 도메인의 `/api/health`도 확인한다. 내부 상태 확인은 Node 서버만 확인하고, 외부 확인은 리버스 프록시와 도메인 연결까지 함께 확인한다.

## 실패 진단

Actions에서 다음 순서로 본다.

1. `Build shared package`, `Test backend`, `Build backend`
2. `Upload deployment files to S3`
3. `Deploy release with AWS Systems Manager`의 `Status`, 표준 출력과 표준 오류

SSM 결과를 AWS CLI로 다시 볼 때는 Actions가 출력한 command ID를 사용한다.

```bash
aws ssm get-command-invocation \
  --region ap-northeast-2 \
  --command-id '<command-id>' \
  --instance-id i-02f657a1399d6f974
```

EC2에서는 아래 로그를 확인한다.

```bash
pm2 describe sopum-api
pm2 logs sopum-api --lines 200
```

공유 `.env`가 없거나 아티팩트·스크립트 체크섬이 다르면 `current`를 바꾸기 전에 실패한다. PM2 재시작이나 상태 확인이 실패하면 이전 릴리스로 자동 롤백하고 Actions도 실패한다.

## 이전 버전 재배포

GitHub Actions에서 배포하려는 커밋의 과거 실행을 열고 `Re-run all jobs`를 누른다. 같은 커밋 SHA의 S3 릴리스를 다시 검증하고 PM2를 재시작한다.

자동 롤백 뒤에도 서비스가 정상화되지 않으면 먼저 아래 상태를 확인한다. `current` 링크를 손으로 바꾸는 작업은 자동 절차까지 실패했을 때만 수행한다.

```bash
readlink -f /home/ubuntu/sopum-map-deploy/current
ls -la /home/ubuntu/sopum-map-deploy/releases
pm2 list
```
