"use client";

import {
  VISIT_LOG_IMAGE_MAX_COUNT,
  type MyVisitLogImage,
} from "@sopum-map/shared";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  createVisitLogImageUpload,
  uploadVisitLogImageToS3,
} from "@/api/upload/upload.api";
import { CameraIcon, CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { processVisitLogImage } from "@/lib/visit-log-image";

const IMAGE_TILE_CLASS_NAME = "size-28 shrink-0";

export type VisitLogImageFormValue =
  | Readonly<{ type: "existing"; key: string }>
  | Readonly<{ type: "new"; uploadId: string }>;

type NewEntry = {
  id: string;
  type: "new";
  originalFile: File;
  processedFile?: File;
  previewUrl: string;
  status: "processing" | "uploading" | "uploaded" | "error";
  progress: number;
  uploadId?: string;
  error?: string;
};

type ExistingEntry = {
  id: string;
  type: "existing";
  key: string;
  previewUrl: string;
  status: "uploaded";
};

type Entry = NewEntry | ExistingEntry;

type Props = Readonly<{
  initialImages?: readonly MyVisitLogImage[];
  disabled?: boolean;
  scrollerClassName?: string;
  onChange: (
    images: readonly VisitLogImageFormValue[],
    state: Readonly<{ isBusy: boolean; hasError: boolean }>,
  ) => void;
}>;

/** 업로드 가능한 항목만 API 요청 이미지 구조로 변환합니다. */
function toFormValues(entries: readonly Entry[]): VisitLogImageFormValue[] {
  return entries.reduce<VisitLogImageFormValue[]>((values, entry) => {
    if (entry.type === "existing") {
      values.push({ type: "existing", key: entry.key });
    } else if (entry.status === "uploaded" && entry.uploadId) {
      values.push({ type: "new", uploadId: entry.uploadId });
    }
    return values;
  }, []);
}

/** 방문 로그 사진의 변환·직접 업로드와 가로 미리보기를 관리합니다. */
export function VisitLogImagePicker({
  initialImages = [],
  disabled = false,
  scrollerClassName = "",
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const controllersRef = useRef(new Map<string, AbortController>());
  const initialEntries = useRef<Entry[]>(
    initialImages.map((image) => ({
      id: image.key,
      type: "existing",
      key: image.key,
      previewUrl: image.url,
      status: "uploaded",
    })),
  );
  const entriesRef = useRef<Entry[]>(initialEntries.current);
  const [entries, setEntries] = useState<Entry[]>(initialEntries.current);
  const [selectionError, setSelectionError] = useState("");
  const failedEntry = entries.find(
    (entry): entry is NewEntry =>
      entry.type === "new" && entry.status === "error",
  );

  /** 화면 상태와 부모 폼 값을 한 번에 갱신합니다. */
  const commit = (next: Entry[]) => {
    entriesRef.current = next;
    setEntries(next);
    onChange(toFormValues(next), {
      isBusy: next.some(
        (entry) =>
          entry.status === "processing" || entry.status === "uploading",
      ),
      hasError: next.some((entry) => entry.status === "error"),
    });
  };

  /** 특정 신규 사진을 WebP로 처리하고 새 서명으로 S3에 올립니다. */
  const processAndUpload = async (id: string, reuseProcessed = false) => {
    const current = entriesRef.current.find((entry) => entry.id === id);
    if (!current || current.type !== "new") return;

    controllersRef.current.get(id)?.abort();
    const controller = new AbortController();
    controllersRef.current.set(id, controller);

    try {
      let processedFile = reuseProcessed ? current.processedFile : undefined;
      if (!processedFile) {
        commit(
          entriesRef.current.map((entry) =>
            entry.id === id
              ? {
                  ...current,
                  status: "processing",
                  progress: 0,
                  error: undefined,
                }
              : entry,
          ),
        );
        processedFile = await processVisitLogImage(
          current.originalFile,
          controller.signal,
        );
      }

      const latest = entriesRef.current.find((entry) => entry.id === id);
      if (!latest || latest.type !== "new") return;
      commit(
        entriesRef.current.map((entry) =>
          entry.id === id
            ? {
                ...latest,
                processedFile,
                status: "uploading",
                progress: 0,
                error: undefined,
              }
            : entry,
        ),
      );

      const upload = await createVisitLogImageUpload({
        contentType: "image/webp",
        fileSize: processedFile.size,
      });
      await uploadVisitLogImageToS3(
        upload,
        processedFile,
        controller.signal,
        (progress) => {
          const uploading = entriesRef.current.find((entry) => entry.id === id);
          if (!uploading || uploading.type !== "new") return;
          commit(
            entriesRef.current.map((entry) =>
              entry.id === id ? { ...uploading, progress } : entry,
            ),
          );
        },
      );

      const uploaded = entriesRef.current.find((entry) => entry.id === id);
      if (!uploaded || uploaded.type !== "new") return;
      commit(
        entriesRef.current.map((entry) =>
          entry.id === id
            ? {
                ...uploaded,
                processedFile,
                status: "uploaded",
                progress: 100,
                uploadId: upload.uploadId,
              }
            : entry,
        ),
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      const failed = entriesRef.current.find((entry) => entry.id === id);
      if (!failed || failed.type !== "new") return;
      commit(
        entriesRef.current.map((entry) =>
          entry.id === id
            ? {
                ...failed,
                status: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "사진을 처리하지 못했어요.",
              }
            : entry,
        ),
      );
    }
  };

  /** 선택한 사진을 즉시 미리보기에 넣고 각각 독립적으로 처리합니다. */
  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const availableCount =
      VISIT_LOG_IMAGE_MAX_COUNT - entriesRef.current.length;
    if (files.length > availableCount) {
      setSelectionError(
        `사진은 최대 ${VISIT_LOG_IMAGE_MAX_COUNT}장까지 추가할 수 있어요.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setSelectionError("");
    const additions = Array.from(files).map<NewEntry>((file) => ({
      id: crypto.randomUUID(),
      type: "new",
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      status: "processing",
      progress: 0,
    }));
    commit([...entriesRef.current, ...additions]);
    additions.forEach((entry) => void processAndUpload(entry.id));
    if (inputRef.current) inputRef.current.value = "";
  };

  /** 사진을 제거하며 진행 중 작업과 로컬 URL도 함께 정리합니다. */
  const removeEntry = (id: string) => {
    const target = entriesRef.current.find((entry) => entry.id === id);
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);
    if (target?.type === "new") URL.revokeObjectURL(target.previewUrl);
    commit(entriesRef.current.filter((entry) => entry.id !== id));
  };

  useEffect(() => {
    const controllers = controllersRef.current;
    return () => {
      controllers.forEach((controller) => controller.abort());
      entriesRef.current.forEach((entry) => {
        if (entry.type === "new") URL.revokeObjectURL(entry.previewUrl);
      });
    };
  }, []);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <div
        role="group"
        className={[
          "mt-3 flex gap-1 overflow-x-auto overscroll-x-contain pb-2 z-100!",
          scrollerClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="방문 로그 사진"
      >
        <div className={IMAGE_TILE_CLASS_NAME}>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || entries.length >= VISIT_LOG_IMAGE_MAX_COUNT}
            onClick={() => inputRef.current?.click()}
            className="size-full! min-h-0! flex-col gap-1! border-dashed! border-gray-200! px-2! py-3! [&>span]:flex [&>span]:flex-col [&>span]:items-center [&>span]:gap-1"
          >
            <CameraIcon className="size-8! text-gray-500" />
            <span>사진 추가</span>
            <span className="text-11 font-normal text-black-500">
              {entries.length}/{VISIT_LOG_IMAGE_MAX_COUNT}
            </span>
          </Button>
        </div>

        {entries.length > 0 ? (
          <ol className="contents" aria-label="첨부 사진 목록">
            {entries.map((entry, index) => (
              <li key={entry.id} className={IMAGE_TILE_CLASS_NAME}>
                <div className="relative size-full overflow-hidden rounded-card bg-black-100">
                  <Image
                    unoptimized
                    fill
                    src={entry.previewUrl}
                    alt={`첨부 사진 ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="object-cover"
                    sizes="112px"
                  />
                  <Button
                    iconOnly
                    size="small"
                    variant="ghost"
                    aria-label={`첨부 사진 ${index + 1} 삭제`}
                    disabled={disabled}
                    onClick={() => removeEntry(entry.id)}
                    className="absolute right-1 top-1 z-20 min-h-8! size-8! bg-white/90!"
                  >
                    <CloseIcon />
                  </Button>

                  {entry.type === "new" &&
                  (entry.status === "processing" ||
                    entry.status === "uploading") ? (
                    <div
                      role="progressbar"
                      aria-label={`첨부 사진 ${index + 1} 업로드`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={
                        entry.status === "uploading"
                          ? entry.progress
                          : undefined
                      }
                      className="absolute inset-x-2 bottom-2 z-10 h-1.5 overflow-hidden rounded-full bg-white/70"
                    >
                      <span
                        className={`block h-full rounded-full bg-green-500 transition-[width] ${entry.status === "processing" ? "motion-safe:animate-pulse" : ""}`}
                        style={{
                          width:
                            entry.status === "processing"
                              ? "35%"
                              : `${entry.progress}%`,
                        }}
                      />
                    </div>
                  ) : null}

                  {entry.status === "error" ? (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/60 px-2 text-center text-white">
                      <span className="text-12 font-semibold">업로드 실패</span>
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={disabled}
                        aria-describedby={`${entry.id}-upload-error`}
                        onClick={() =>
                          void processAndUpload(
                            entry.id,
                            Boolean(entry.processedFile),
                          )
                        }
                        className="min-h-8! px-2!"
                      >
                        다시 시도
                      </Button>
                      <span id={`${entry.id}-upload-error`} className="sr-only">
                        {entry.error}
                      </span>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
      {selectionError ? (
        <p role="alert" className="mt-2 text-12 text-red-600">
          {selectionError}
        </p>
      ) : null}
      {failedEntry?.error ? (
        <p role="alert" className="mt-2 text-12 text-red-600">
          {failedEntry.error}
        </p>
      ) : null}
    </div>
  );
}
