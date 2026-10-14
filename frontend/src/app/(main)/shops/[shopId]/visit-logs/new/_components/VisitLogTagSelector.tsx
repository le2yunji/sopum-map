"use client";

import {
  ACTIVE_TAG_DEFINITIONS,
  TAG_DEFINITION_BY_KEY,
  TAG_GROUP_LABELS,
  TAG_GROUPS,
  type TagKey,
} from "@sopum-map/shared";
import type { Ref } from "react";

import { Button } from "@/components/ui/Button";

const MAX_SELECTED_TAG_COUNT = 5;

type Props = Readonly<{
  selectedTagKeys: readonly TagKey[];
  onChange: (selectedTagKeys: readonly TagKey[]) => void;
  errorMessage?: string;
  firstTagRef?: Ref<HTMLButtonElement>;
}>;

/** 방문 로그에 붙일 태그를 그룹별로 최대 5개까지 선택하게 합니다. */
export function VisitLogTagSelector({
  selectedTagKeys,
  onChange,
  errorMessage,
  firstTagRef,
}: Props) {
  const hasReachedLimit = selectedTagKeys.length >= MAX_SELECTED_TAG_COUNT;

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
          <p className="mt-1 text-13 text-black-500">1개 이상, 최대 5개까지 선택해 주세요.</p>
        </div>
        <span className="shrink-0 text-13 text-black-500">
          {selectedTagKeys.length}/{MAX_SELECTED_TAG_COUNT}
        </span>
      </div>

      {selectedTagKeys.length > 0 && (
        <div aria-label="선택한 태그" className="flex flex-wrap gap-2">
          {selectedTagKeys.map((tagKey) => {
            const tag = TAG_DEFINITION_BY_KEY[tagKey];

            return (
              <Button
                key={tagKey}
                variant="secondary"
                size="small"
                aria-label={`선택한 태그 ${tag.label} 삭제`}
                onClick={() => toggleTag(tagKey)}
                className="min-h-9 rounded-full px-3"
              >
                {tag.label} ×
              </Button>
            );
          })}
        </div>
      )}

      <div id="visit-log-tag-groups" className="space-y-5">
        {TAG_GROUPS.map((group) => {
          const tags = ACTIVE_TAG_DEFINITIONS.filter((tag) => tag.group === group);

          if (tags.length === 0) {
            return null;
          }

          return (
            <fieldset key={group} className="space-y-2">
              <legend className="text-14 font-semibold text-black-800">
                {TAG_GROUP_LABELS[group]}
              </legend>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, tagIndex) => {
                  const isSelected = selectedTagKeys.includes(tag.key);

                  return (
                    <Button
                      key={tag.key}
                      ref={group === TAG_GROUPS[0] && tagIndex === 0 ? firstTagRef : undefined}
                      variant={isSelected ? "secondary" : "outline"}
                      size="small"
                      aria-pressed={isSelected}
                      disabled={!isSelected && hasReachedLimit}
                      onClick={() => toggleTag(tag.key)}
                      className={isSelected ? "border border-green-500" : ""}
                    >
                      {tag.label}
                    </Button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      {errorMessage && (
        <p id="visit-log-tags-error" role="alert" className="text-13 text-red-500">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
