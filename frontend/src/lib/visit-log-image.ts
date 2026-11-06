import {
  VISIT_LOG_IMAGE_INPUT_TYPES,
  VISIT_LOG_IMAGE_MAX_BYTES,
  VISIT_LOG_IMAGE_MAX_EDGE,
  type VisitLogImageInputType,
} from "@sopum-map/shared";
import { fromBlob } from "image-resize-compress";

const ALLOWED_TYPES = new Set<string>(VISIT_LOG_IMAGE_INPUT_TYPES);
const HEIF_BRANDS = new Set(["mif1", "msf1", "heic", "heix", "hevc", "hevx"]);

/** 파일의 앞부분을 읽어 MIME 선언과 무관하게 실제 이미지 형식을 판별합니다. */
export async function detectVisitLogImageType(
  file: Blob,
): Promise<VisitLogImageInputType | null> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  const ascii = new TextDecoder("ascii").decode(bytes);
  if (ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP") {
    return "image/webp";
  }
  const brand = ascii.slice(8, 12);
  if (ascii.slice(4, 8) === "ftyp" && HEIF_BRANDS.has(brand)) {
    return brand.startsWith("hei") ? "image/heic" : "image/heif";
  }
  return null;
}

/** 원본 정책을 검증하고 긴 변 1920px 이하 WebP로 변환합니다. */
export async function processVisitLogImage(
  file: File,
  signal?: AbortSignal,
): Promise<File> {
  if (file.size > VISIT_LOG_IMAGE_MAX_BYTES) {
    throw new Error("사진은 장당 5MB 이하만 선택할 수 있어요.");
  }
  const detectedType = await detectVisitLogImageType(file);
  if (!detectedType || !ALLOWED_TYPES.has(detectedType)) {
    throw new Error("JPEG, PNG, WebP, HEIC 사진만 선택할 수 있어요.");
  }

  let source: Blob = file;
  if (detectedType === "image/heic" || detectedType === "image/heif") {
    try {
      const { convertHeic } = await import("@su-engineering/heic");
      const convertedHeic = await convertHeic(file, {
        type: "image/png",
        maxDimension: VISIT_LOG_IMAGE_MAX_EDGE,
        signal,
      });
      source = convertedHeic.blob;
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new Error(
        "이 브라우저에서는 HEIC 사진을 변환할 수 없어요. JPEG나 PNG로 바꿔 다시 선택해 주세요.",
      );
    }
  }

  const converted = await fromBlob(source, {
    format: "webp",
    quality: 85,
    maxWidthOrHeight: VISIT_LOG_IMAGE_MAX_EDGE,
    targetSize: VISIT_LOG_IMAGE_MAX_BYTES,
    signal,
  });
  if (converted.size > VISIT_LOG_IMAGE_MAX_BYTES) {
    throw new Error("변환한 사진이 5MB를 넘어요. 다른 사진을 선택해 주세요.");
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "visit-log-image";
  return new File([converted], `${baseName}.webp`, { type: "image/webp" });
}
