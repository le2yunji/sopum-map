"use client";

import { VISIT_LOG_IMAGE_MAX_COUNT, type MyVisitLogImage } from "@sopum-map/shared";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  createVisitLogImageUpload,
  uploadVisitLogImageToS3,
} from "@/api/upload/upload.api";
import { CameraIcon, CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { processVisitLogImage } from "@/lib/visit-log-image";

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

/** 방문 로그 사진의 변환·직접 업로드·미리보기·순서 변경을 관리합니다. */
export function VisitLogImagePicker({
  initialImages = [],
  disabled = false,
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

  /** 화면 상태와 부모 폼 값을 한 번에 갱신합니다. */
  const commit = (next: Entry[]) => {
    entriesRef.current = next;
    setEntries(next);
    onChange(toFormValues(next), {
      isBusy: next.some(
        (entry) => entry.status === "processing" || entry.status === "uploading",
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
            entry.id === id ? { ...current, status: "processing", error: undefined } : entry,
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
            ? { ...latest, processedFile, status: "uploading", error: undefined }
            : entry,
        ),
      );

      const upload = await createVisitLogImageUpload({
        contentType: "image/webp",
        fileSize: processedFile.size,
      });
      await uploadVisitLogImageToS3(upload, processedFile, controller.signal);

      const uploaded = entriesRef.current.find((entry) => entry.id === id);
      if (!uploaded || uploaded.type !== "new") return;
      commit(
        entriesRef.current.map((entry) =>
          entry.id === id
            ? { ...uploaded, processedFile, status: "uploaded", uploadId: upload.uploadId }
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
                error: error instanceof Error ? error.message : "사진을 처리하지 못했어요.",
              }
            : entry,
        ),
      );
    }
  };

  /** 선택한 사진을 즉시 미리보기에 넣고 각각 독립적으로 처리합니다. */
  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const availableCount = VISIT_LOG_IMAGE_MAX_COUNT - entriesRef.current.length;
    if (files.length > availableCount) {
      setSelectionError(`사진은 최대 ${VISIT_LOG_IMAGE_MAX_COUNT}장까지 추가할 수 있어요.`);
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

  /** 버튼 조작만으로도 사진 표시 순서를 바꿀 수 있게 합니다. */
  const moveEntry = (index: number, offset: -1 | 1) => {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= entriesRef.current.length) return;
    const next = [...entriesRef.current];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    commit(next);
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
      <Button
        type="button"
        variant="outline"
        leftIcon={<CameraIcon />}
        disabled={disabled || entries.length >= VISIT_LOG_IMAGE_MAX_COUNT}
        onClick={() => inputRef.current?.click()}
        className="mt-3"
      >
        사진 추가 ({entries.length}/{VISIT_LOG_IMAGE_MAX_COUNT})
      </Button>

      {entries.length > 0 ? (
        <ol className="mt-4 grid grid-cols-3 gap-2" aria-label="첨부 사진 목록">
          {entries.map((entry, index) => (
            <li key={entry.id} className="min-w-0">
              <div className="relative aspect-square overflow-hidden rounded-card bg-black-100">
                <Image
                  unoptimized
                  fill
                  src={entry.previewUrl}
                  alt={`첨부 사진 ${index + 1}`}
                  className="object-cover"
                  sizes="140px"
                />
                <Button
                  iconOnly
                  size="small"
                  variant="ghost"
                  aria-label={`첨부 사진 ${index + 1} 삭제`}
                  disabled={disabled}
                  onClick={() => removeEntry(entry.id)}
                  className="absolute right-0 top-0 min-h-9! size-9! bg-white/90!"
                >
                  <CloseIcon />
                </Button>
              </div>
              <p className="mt-1 truncate text-11 text-black-500" role="status">
                {entry.status === "processing" && "사진 변환 중"}
                {entry.status === "uploading" && "업로드 중"}
                {entry.status === "uploaded" && "업로드 완료"}
                {entry.status === "error" && entry.error}
              </p>
              <div className="mt-1 flex gap-1">
                <Button size="small" variant="ghost" disabled={disabled || index === 0} onClick={() => moveEntry(index, -1)} className="min-h-8! flex-1 px-1!">앞으로</Button>
                <Button size="small" variant="ghost" disabled={disabled || index === entries.length - 1} onClick={() => moveEntry(index, 1)} className="min-h-8! flex-1 px-1!">뒤로</Button>
              </div>
              {entry.status === "error" ? (
                <Button size="small" variant="ghost" disabled={disabled} onClick={() => void processAndUpload(entry.id, Boolean(entry.processedFile))} className="mt-1 min-h-8! w-full">다시 시도</Button>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
      {selectionError ? <p role="alert" className="mt-2 text-12 text-red-600">{selectionError}</p> : null}
    </div>
  );
}
