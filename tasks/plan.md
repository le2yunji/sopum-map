# Implementation Plan: 방문 로그 S3 이미지 업로드

## Overview

방문 로그에 최대 3장의 이미지를 첨부한다. 브라우저가 이미지를 WebP로 변환하고 Private S3에 Presigned POST로 직접 업로드하며, API는 업로드 소유권과 실제 객체를 검증한 뒤 방문 로그에 최종 Object Key를 연결한다.

## Architecture Decisions

- 방문 로그 전용 `UploadAsset`만 두고 범용 업로드 계층은 만들지 않는다.
- 클라이언트는 Object Key 대신 `uploadId`만 제출한다.
- 임시 객체를 최종 경로로 복사한 뒤 MongoDB에 연결하며, 각 단계는 재실행해도 안전하도록 상태를 기록한다.
- DB에는 `images: [{ key }]`만 저장하고 응답에서 `IMAGE_BASE_URL` 기반 URL을 만든다.
- 이미지 처리 정책은 최대 3장, 원본·변환본 각각 5MiB, 긴 변 1920px, 최종 WebP로 고정한다.
- 실제 AWS 리소스 변경은 코드 구현과 분리하고 적용 가능한 설정 문서로 제공한다.

## Task List

### Phase 1: 업로드 기반

- [x] 공용 업로드 계약과 정책 상수 정의
- [x] UploadAsset 모델과 Presigned POST 발급 API 구현
- [x] 인증·발급 제한·POST Policy 테스트

### Checkpoint: 업로드 기반

- [x] 공용 패키지와 백엔드 집중 테스트 통과
- [x] AWS 자격 증명 없이 단위 테스트 가능

### Phase 2: 방문 로그 연결

- [x] 방문 로그 스키마를 `images`로 통합
- [x] 생성 시 임시 객체 검증·최종 확정 연결
- [x] 조회 URL 변환과 수정 이미지 병합 구현
- [x] 로그 삭제 및 제거 이미지 S3 정리 구현

### Checkpoint: 방문 로그 연결

- [x] 생성·조회·수정·삭제 실패 복구 테스트 통과
- [x] 타인 uploadId와 Object Key 사용 차단

### Phase 3: 브라우저 UX

- [x] JPEG·PNG·WebP·HEIC/HEIF를 WebP로 변환
- [x] 미리보기·진행·재시도·삭제·순서 변경 UI 구현
- [x] 작성과 수정 요청에 업로드 결과 연결

### Phase 4: 운영 준비

- [x] 24시간 지난 고아 업로드 정리 명령 구현
- [x] S3·IAM·CORS·CloudFront·스케줄 설정 문서 작성
- [x] 전체 테스트·린트·빌드·공백 검사

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| S3와 MongoDB를 하나의 트랜잭션으로 묶을 수 없음 | 최종 객체 또는 상태가 남을 수 있음 | UploadAsset 상태와 멱등 처리, 정리 작업 사용 |
| 브라우저별 HEIC 디코딩 차이 | 일부 사용자의 업로드 실패 | 유지 중인 브라우저 라이브러리를 지연 로드하고 명확한 오류 표시 |
| Private S3 조회 구성 누락 | 저장은 되지만 이미지가 보이지 않음 | CloudFront OAC와 `IMAGE_BASE_URL` 설정을 배포 체크리스트에 포함 |
| 기존 빈 DB 가정이 달라짐 | 필드 전환 시 기존 이미지 손실 | 배포 전 이미지 필드 보유 문서 수를 확인하는 점검 명령 제공 |

## Open Questions

- 실제 AWS Bucket, IAM, CloudFront 변경은 코드 검증 후 별도 적용한다.
