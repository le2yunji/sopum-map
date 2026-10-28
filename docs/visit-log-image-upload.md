# 방문 로그 이미지 업로드 운영 가이드

## API

### `POST /api/uploads/presign`

로그인이 필요하다.

```json
{ "contentType": "image/webp", "fileSize": 824320 }
```

응답의 `fields` 전체를 `FormData`에 먼저 넣고 `file`을 마지막에 넣어 S3 `url`로 POST한다. 서명은 300초 동안 유효하다. 사용자별 미확정 업로드는 12개, 최근 1시간 발급은 30개로 제한한다.

### 방문 로그 생성

`POST /api/shops/:shopId/visit-logs`의 `imageUploadIds`에 업로드 ID를 표시 순서대로 최대 3개 전달한다. Object Key는 받지 않는다.

### 방문 로그 수정

`PATCH /api/visit-logs/:visitLogId`의 `images` 배열 순서가 표시 순서다.

```json
{
  "images": [
    { "type": "existing", "key": "visit-logs/user/a.webp" },
    { "type": "new", "uploadId": "68f..." }
  ]
}
```

기존 키는 해당 방문 로그에 이미 연결된 값만 허용한다.

## 환경변수

```text
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=sopummap-images
IMAGE_BASE_URL=https://images.sopummap.com
```

ECS에서는 Access Key를 넣지 않고 Task Role의 기본 자격 증명 체인을 사용한다.

## S3 설정

- Block Public Access 전체 활성화
- Object Ownership은 Bucket owner enforced
- 기본 암호화 활성화
- CloudFront Origin Access Control(OAC)만 최종 객체를 읽게 설정
- `temporary/` 경로는 CloudFront 동작에서 제외
- 보조 안전장치로 `temporary/` 객체에 2일 Lifecycle 만료 적용

개발·운영 Origin만 허용하는 CORS 예시:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://sopummap.com"
    ],
    "AllowedMethods": ["POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 300
  }
]
```

## ECS Task Role 최소 권한

실제 AWS 계정 ID와 CloudFront 배포에 맞게 리소스를 좁힌다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ManageTemporaryVisitLogImages",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::sopummap-images/temporary/*"
    },
    {
      "Sid": "ManageFinalVisitLogImages",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::sopummap-images/visit-logs/*"
    }
  ]
}
```

`CopyObject`는 원본의 `GetObject`와 대상의 `PutObject` 권한을 함께 사용한다.

## 정리 작업

하루 한 번 EventBridge Scheduler가 동일 ECS 이미지의 다음 명령을 실행하게 한다.

```bash
pnpm --dir backend cleanup:visit-log-uploads
```

24시간 지난 `pending/finalizing` 객체를 정리한다. 활성 방문 로그가 참조하는 `finalizing` 업로드는 `attached`로 복구한다. 삭제된 로그가 참조하던 최종 객체도 제거한다. S3 삭제가 실패하면 관리 레코드를 남겨 다음 실행에서 재시도한다.

## 배포 전 점검

현재 DB에 로그가 없다는 전제로 `imageUrls/imageKeys`를 `images`로 교체했다. 배포 직전에 아래 집계가 0인지 다시 확인한다.

```javascript
db.visitlogs.countDocuments({
  $or: [
    { imageUrls: { $exists: true, $ne: [] } },
    { imageKeys: { $exists: true, $ne: [] } }
  ]
})
```

0이 아니면 기존 객체를 `images: [{ key }]`로 옮기는 마이그레이션을 먼저 작성한다.

## 남는 위험

- S3와 MongoDB는 하나의 트랜잭션이 아니다. `UploadAsset` 상태와 정리 작업으로 복구한다.
- HEIC는 브라우저의 네이티브 디코더 또는 WebCodecs를 사용한다. 둘 다 지원하지 않는 환경에서는 JPEG·PNG 변환 안내를 표시한다. WebP 리사이징·인코딩은 메인 스레드를 쓸 수 있어 저사양 기기 실측이 필요하다.
- 실제 기기의 HEIC 회전, PNG 투명 배경, 5MiB 경계값은 스테이징의 실파일로 확인해야 한다.
