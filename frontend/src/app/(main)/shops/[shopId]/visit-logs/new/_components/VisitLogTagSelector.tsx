"use client";

import {
  ACTIVE_TAG_DEFINITIONS,
  TAG_GROUP_LABELS,
  TAG_GROUPS,
  VISIT_LOG_TAG_MAX_COUNT,
  type TagGroup,
  type TagKey,
} from "@sopum-map/shared";
import { useState, type Ref } from "react";

import { Button } from "@/components/ui/Button";

const DEFAULT_VISIBLE_TAG_COUNT = 6;
const TAG_GROUP_COPY = {
  product: {
    title: "어떤 소품이 있었나요?",
    description: "기억에 남는 상품이나 캐릭터를 선택해 주세요.",
  },
  mood: {
    title: "어떤 분위기였나요?",
    description: "매장에서 느낀 분위기를 골라보세요.",
  },
  experience: {
    title: "방문 경험은 어땠나요?",
    description: "다른 소품 수집가에게 도움이 되는 정보를 알려주세요.",
  },
} as const;

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
  const [expandedGroups, setExpandedGroups] = useState<readonly TagGroup[]>([]);
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

      <div id="visit-log-tag-groups" className="space-y-5">
        {TAG_GROUPS.map((group) => {
          const tags = ACTIVE_TAG_DEFINITIONS.filter((tag) => tag.group === group);
          const isExpanded = expandedGroups.includes(group);
          const visibleTags = isExpanded
            ? tags
            : tags.slice(0, DEFAULT_VISIBLE_TAG_COUNT);
          const copy = TAG_GROUP_COPY[group];

          if (tags.length === 0) {
            return null;
          }

          return (
            <fieldset key={group} className="space-y-2">
              <legend className="text-16 font-semibold text-black-900">{copy.title}</legend>
              <p className="text-13 text-black-500">{copy.description}</p>
              <div className="flex flex-wrap gap-2">
                {visibleTags.map((tag, tagIndex) => {
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
                      className={`min-h-9! rounded-full! px-3! py-1! ${
                        isSelected ? "border border-green-500 bg-green-100" : ""
                      }`}
                    >
                      {tag.label}
                    </Button>
                  );
                })}
              </div>
              {tags.length > DEFAULT_VISIBLE_TAG_COUNT && (
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedGroups((current) =>
                      isExpanded
                        ? current.filter((currentGroup) => currentGroup !== group)
                        : [...current, group],
                    )
                  }
                >
                  {isExpanded ? `${TAG_GROUP_LABELS[group]} 접기` : `${TAG_GROUP_LABELS[group]} 더보기`}
                </Button>
              )}
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
