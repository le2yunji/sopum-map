"use client";

import {
  VISIT_LOG_TAG_MAX_COUNT,
  type TagKey,
} from "@sopum-map/shared";
import type { Ref } from "react";

import { TagQuestionList } from "@/components/tag/TagQuestionList";

type Props = Readonly<{
  selectedTagKeys: readonly TagKey[];
  onChange: (selectedTagKeys: readonly TagKey[]) => void;
  errorMessage?: string;
  firstTagRef?: Ref<HTMLButtonElement>;
}>;

/** 방문 로그에 붙일 태그를 그룹별로 최대 허용 개수까지 선택하게 합니다. */
export function VisitLogTagSelector({
  selectedTagKeys,
  onChange,
  errorMessage,
  firstTagRef,
}: Props) {
  const hasReachedLimit = selectedTagKeys.length >= VISIT_LOG_TAG_MAX_COUNT;

  /** 선택 여부를 반대로 바꾸되 최대 개수를 넘기지 않습니다. */
  const toggleTag = (tagKey: TagKey) => {
    if (selectedTagKeys.includes(tagKey)) {
      onChange(selectedTagKeys.filter((selectedKey) => selectedKey !== tagKey));
      return;
    }

    if (!hasReachedLimit) {
      onChange([...selectedTagKeys, tagKey]);
    }
  };

  return (
    <section
      aria-labelledby="visit-log-tags-title"
      aria-describedby={errorMessage ? "visit-log-tags-error" : undefined}
      className="space-y-4"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="visit-log-tags-title" className="text-16 font-semibold text-black-950">
            이 상점은 어땠나요?
          </h2>
          <p className="mt-1 text-13 text-black-500">
            1개 이상, 최대 {VISIT_LOG_TAG_MAX_COUNT}개까지 선택해 주세요.
          </p>
        </div>
        <span className="shrink-0 text-13 text-black-500">
          {selectedTagKeys.length}/{VISIT_LOG_TAG_MAX_COUNT}
        </span>
      </div>

      <div id="visit-log-tag-groups">
        <TagQuestionList
          selectedTagKeys={selectedTagKeys}
          onToggleTag={toggleTag}
          isTagDisabled={(tagKey) => !selectedTagKeys.includes(tagKey) && hasReachedLimit}
          firstTagRef={firstTagRef}
        />
      </div>

      {errorMessage && (
        <p id="visit-log-tags-error" role="alert" className="text-13 text-red-500">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
