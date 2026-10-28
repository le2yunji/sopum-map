# EC2 백엔드 빌드 OOM 트러블슈팅

## 상태

- 발생일: 2026-10-26
- 문서화 및 단기 조치: 2026-10-28
- 현재 상태: 1GB Swap 추가 후 빌드 성공, 장기 배포 구조 개선 예정

## 요약

프로덕션 EC2에서 `pnpm --dir backend build`를 실행하던 중 TypeScript 컴파일러가 종료됐다. 원인은 디스크 부족이나 Systems Manager 명령 전달 실패가 아니라, 약 1GB RAM을 가진 인스턴스에서 운영 프로세스와 빌드 프로세스를 함께 실행해 발생한 OOM(Out Of Memory)이었다.

단기 조치로 1GB Swap 파일을 추가했고 같은 `shared` 및 `backend` 빌드를 다시 실행해 성공을 확인했다. 장기적으로는 EC2에서 소스 코드를 빌드하지 않고 GitHub Actions Runner에서 만든 배포 아티팩트만 EC2로 전달하는 구조로 전환한다.

## 환경

| 항목 | 값 |
| --- | --- |
| 운영체제 | Ubuntu 24.04 LTS |
| Node.js | 24.22.1 |
| pnpm | 10.34.4 |
| 프로세스 관리자 | PM2 |
| 배포 대상 | Express 백엔드 |
| 물리 RAM | 952MiB |
| 장애 당시 Swap | 없음 |
| 루트 파일시스템 | 6.8GB |
| 장애 확인 당시 디스크 | 4.3GB 사용, 2.5GB 여유, 사용률 63% |

공개 문서에는 AWS 계정 ID, 인스턴스 ID, 공인 IP와 SSH 키 경로를 기록하지 않는다.

## 증상

배포 스크립트는 의존성 설치와 공용 패키지 빌드를 마치고 백엔드 TypeScript 빌드에 진입했다.

```text
Installing dependencies...
Building shared package...
Building backend...

> backend@1.0.0 build
> tsc
```

이후 `Reloading PM2...`와 `Deployment succeeded.`가 출력되지 않았고 배포 프로세스가 사라졌다. PM2와 `/api/health`는 정상이었지만 이는 새 배포가 성공했다는 의미가 아니라 기존 서버 프로세스가 계속 실행 중이었기 때문이다.

## 조사 결과

### 실행 중인 빌드 프로세스 확인

```bash
ps -eo pid,etime,%cpu,%mem,cmd \
  | grep -E 'deploy-sopum-map|tsc|typescript' \
  | grep -v grep
```

빌드가 중단된 뒤에는 관련 프로세스가 남아 있지 않았다.

### 메모리 확인

```bash
free -h
```

```text
Mem:  952Mi total
Swap: 0B
```

### 커널 OOM 기록 확인

```bash
sudo journalctl -k -n 100 --no-pager \
  | grep -iE 'out of memory|oom|killed process'
```

핵심 기록:

```text
Out of memory: Killed process ... anon-rss:472408kB
```

운영체제, PM2, Express, Nginx, SSM Agent 등이 이미 RAM을 사용하고 있는 상태에서 TypeScript 컴파일러가 약 461MiB 이상의 메모리를 추가로 사용해 전체 RAM 한도를 넘었다. 사용할 Swap이 없었기 때문에 Linux OOM Killer가 빌드 프로세스를 종료했다.

## 배제한 원인

### 디스크 부족

장애 시점의 루트 파일시스템 사용률은 63%였고 2.5GB가 남아 있었다. `No space left on device` 오류도 없었으므로 직접 원인이 아니었다.

### Systems Manager 연결 실패

SSM 진단에서 EC2 메타데이터, AWS 자격 증명, Agent 서비스와 `ssm`, `ssmmessages` 엔드포인트 연결이 모두 성공했다. Run Command도 최종적으로 성공했으므로 SSM은 빌드 OOM과 별개의 문제였다.

### PM2 또는 애플리케이션 장애

PM2 프로세스는 `online`이었고 내부 health check도 성공했다. 다만 기존 프로세스가 살아 있다는 사실은 새 빌드와 배포의 성공을 보장하지 않으므로 배포 스크립트의 종료 코드와 마지막 성공 메시지를 별도로 확인해야 한다.

## 단기 조치: 1GB Swap 추가

장애 당시 디스크 여유가 2.5GB뿐이었으므로 2GB Swap은 남은 디스크를 약 0.5GB까지 줄여 운영 위험이 컸다. RAM 부족을 완충하면서 최소한의 디스크 여유를 남기기 위해 1GB를 선택했다.

```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

재부팅 후에도 자동 활성화되도록 등록했다.

```bash
grep -q '^/swapfile[[:space:]]' /etc/fstab \
  || echo '/swapfile none swap sw 0 0' \
  | sudo tee -a /etc/fstab
```

확인 명령:

```bash
free -h
sudo swapon --show
grep '^/swapfile[[:space:]]' /etc/fstab
```

## 검증 결과

Swap 추가 후 원래 실패했던 빌드를 같은 EC2에서 다시 실행했다.

```bash
pnpm --dir packages build
pnpm --dir backend build
```

두 빌드 모두 종료 코드 0으로 성공했다. 빌드 후 상태는 다음과 같았다.

```text
RAM:       952MiB total, 570MiB available
Swap:      1.0GiB total, 약 105MiB used
Disk:      6.8GB total, 1.5GB available, 78% used
API health: success
```

Swap이 실제로 사용됐고 새로운 OOM 기록 없이 빌드가 완료됐으므로 단기 조치가 원래 실패 조건을 완화했음을 확인했다.

## 장기 조치: EC2에서 빌드하지 않기

Swap은 RAM을 늘리는 기능이 아니라 느린 디스크를 비상 메모리로 사용하는 안전장치다. 프로덕션 서버에서 애플리케이션 실행과 TypeScript 빌드를 함께 수행하는 구조는 트래픽이나 의존성 증가에 따라 다시 불안정해질 수 있다.

목표 배포 흐름은 다음과 같다.

```text
GitHub main 변경
→ GitHub-hosted Actions Runner에서 install, test, build
→ 실행 파일과 production 의존성을 배포 아티팩트로 생성
→ S3에 커밋 SHA 단위로 업로드
→ OIDC로 받은 임시 AWS 권한으로 SSM SendCommand 호출
→ EC2가 S3에서 아티팩트 다운로드
→ 새 release로 전환
→ PM2 재시작
→ health check
```

이 구조에서는 EC2가 `tsc`를 실행하지 않는다. 1GB Swap은 런타임의 일시적인 메모리 급증을 완화하는 안전장치로 유지한다.

## 후속 작업

- [ ] GitHub Actions에서 `shared`와 `backend` 테스트·빌드를 실행한다.
- [ ] `pnpm deploy`로 production 의존성을 포함한 이동 가능한 아티팩트를 생성한다.
- [ ] 배포용 S3 버킷과 최소 권한의 `PutObject`, `GetObject` 정책을 구성한다.
- [ ] SSM 배포 스크립트를 `git pull + build`에서 `artifact download + release switch` 방식으로 변경한다.
- [ ] `.env`는 아티팩트에 포함하지 않고 EC2에서 별도로 관리한다.
- [ ] 최근 release만 남기고 오래된 압축 파일과 release 디렉터리를 정리한다.
- [ ] 루트 파일시스템 여유가 1GB 아래로 내려가기 전에 EBS 확장을 검토한다.
- [ ] 이전 커밋 아티팩트로 되돌리는 rollback 절차를 검증한다.

## 운영 확인 명령

메모리와 Swap:

```bash
free -h
sudo swapon --show
```

디스크:

```bash
df -h /
```

최근 OOM 기록:

```bash
sudo journalctl -k --since '24 hours ago' --no-pager \
  | grep -iE 'out of memory|oom-kill|killed process'
```

애플리케이션:

```bash
pm2 list
pm2 logs sopum-api --lines 100 --nostream
curl --fail http://127.0.0.1:4000/api/health
```

## 재발 판단 기준

다음 중 하나가 발생하면 인스턴스 크기 또는 배포 구조를 다시 검토한다.

- Swap 사용량이 지속해서 증가하고 회수되지 않는다.
- 런타임 중 OOM Killer 기록이 다시 발생한다.
- 루트 파일시스템 사용률이 85%를 넘는다.
- 배포 아티팩트를 사용한 뒤에도 PM2 재시작 중 health check가 실패한다.
- API 응답 지연이 Swap 사용 시점과 함께 증가한다.
