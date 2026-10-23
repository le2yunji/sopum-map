import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import {
  VISIT_LOG_IMAGE_MAX_BYTES,
  VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE,
  createApiError,
} from "@sopum-map/shared";

import { env } from "../../config/env.js";
import {
  VISIT_LOG_UPLOAD_EXPIRES_SECONDS,
  VISIT_LOG_UPLOAD_POLICY_OVERHEAD_BYTES,
} from "./upload.constants.js";

let s3Client: S3Client | undefined;

/** 이미지 저장소 설정 누락을 서비스 오류로 명확하게 알립니다. */
function getImageStorageConfig(): { region: string; bucket: string } {
  if (!env.s3BucketName) {
    throw createApiError({
      status: 503,
      code: "IMAGE_STORAGE_NOT_CONFIGURED",
      message: "이미지 저장소가 아직 설정되지 않았습니다.",
    });
  }

  return { region: env.awsRegion, bucket: env.s3BucketName };
}

/** AWS 기본 자격 증명 체인을 사용하는 S3 클라이언트를 재사용합니다. */
function getS3Client(): S3Client {
  if (!s3Client) {
    const { region } = getImageStorageConfig();
    s3Client = new S3Client({ region });
  }

  return s3Client;
}

/** 정확한 임시 키와 WebP 형식, 업로드 크기를 제한한 POST 서명을 만듭니다. */
export async function createVisitLogImagePresignedPost(params: {
  key: string;
  uploadId: string;
}): Promise<{ url: string; fields: Record<string, string> }> {
  const { bucket } = getImageStorageConfig();
  return createPresignedPost(getS3Client(), {
    Bucket: bucket,
    Key: params.key,
    Expires: VISIT_LOG_UPLOAD_EXPIRES_SECONDS,
    Fields: {
      "Content-Type": VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE,
      "x-amz-meta-upload-id": params.uploadId,
    },
    Conditions: [
      [
        "content-length-range",
        1,
        VISIT_LOG_IMAGE_MAX_BYTES + VISIT_LOG_UPLOAD_POLICY_OVERHEAD_BYTES,
      ],
      { "Content-Type": VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE },
      { "x-amz-meta-upload-id": params.uploadId },
    ],
  });
}

/** 임시 객체가 요청 당시의 크기와 형식으로 실제 저장됐는지 확인합니다. */
export async function inspectTemporaryVisitLogImage(key: string): Promise<{
  contentLength: number;
  contentType: string;
  uploadId?: string;
  hasWebpSignature: boolean;
}> {
  const { bucket } = getImageStorageConfig();
  const result = await getS3Client().send(
    new HeadObjectCommand({ Bucket: bucket, Key: key }),
  );

  const object = await getS3Client().send(
    new GetObjectCommand({ Bucket: bucket, Key: key, Range: "bytes=0-11" }),
  );
  const bytes = object.Body
    ? await object.Body.transformToByteArray()
    : new Uint8Array();
  const signature = new TextDecoder("ascii").decode(bytes);

  return {
    contentLength: result.ContentLength ?? 0,
    contentType: result.ContentType ?? "",
    uploadId: result.Metadata?.["upload-id"],
    hasWebpSignature:
      signature.startsWith("RIFF") && signature.slice(8, 12) === "WEBP",
  };
}

/** 검증된 임시 이미지를 공개 조회용 최종 prefix로 복사합니다. */
export async function copyVisitLogImage(
  temporaryKey: string,
  finalKey: string,
): Promise<void> {
  const { bucket } = getImageStorageConfig();
  await getS3Client().send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: finalKey,
      CopySource: `${bucket}/${encodeURIComponent(temporaryKey).replaceAll("%2F", "/")}`,
      ContentType: VISIT_LOG_IMAGE_UPLOAD_CONTENT_TYPE,
      MetadataDirective: "REPLACE",
    }),
  );
}

/** 더 이상 참조하지 않는 S3 객체를 삭제합니다. */
export async function deleteVisitLogImageObject(key: string): Promise<void> {
  const { bucket } = getImageStorageConfig();
  await getS3Client().send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key }),
  );
}
