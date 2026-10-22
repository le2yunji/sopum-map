"use client";

import {
  ACTIVE_TAG_DEFINITIONS,
  TAG_GROUP_LABELS,
  TAG_GROUPS,
  type TagGroup,
  type TagKey,
} from "@sopum-map/shared";
import { useState, type Ref } from "react";

import { ChevronRightIcon } from "@/components/icons";
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
  onToggleTag: (tagKey: TagKey) => void;
  displayMode?: "questions" | "categories";
  isTagDisabled?: (tagKey: TagKey) => boolean;
  firstTagRef?: Ref<HTMLButtonElement>;
}>;

/** 공통 태그를 화면 목적에 맞는 제목과 순서로 나누어 보여줍니다. */
export function TagQuestionList({
  selectedTagKeys,
  onToggleTag,
  displayMode = "questions",
  isTagDisabled,
  firstTagRef,
}: Props) {
  const [expandedGroups, setExpandedGroups] = useState<readonly TagGroup[]>([]);

  return (
    <div className="space-y-5">
      {TAG_GROUPS.map((group) => {
        const tags = ACTIVE_TAG_DEFINITIONS.filter((tag) => tag.group === group);
        const isExpanded = expandedGroups.includes(group);
        const visibleTags = isExpanded ? tags : tags.slice(0, DEFAULT_VISIBLE_TAG_COUNT);
        const title =
          displayMode === "categories" ? TAG_GROUP_LABELS[group] : TAG_GROUP_COPY[group].title;
        const description =
          displayMode === "questions" ? TAG_GROUP_COPY[group].description : undefined;

        if (tags.length === 0) {
          return null;
        }

        return (
          <fieldset key={group} className="space-y-2">
            <legend className="text-16 font-semibold text-black-900">{title}</legend>
            {description ? <p className="text-13 text-black-500">{description}</p> : null}
            <div className="flex flex-wrap gap-2">
              {visibleTags.map((tag, tagIndex) => {
                const isSelected = selectedTagKeys.includes(tag.key);

                return (
                  <Button
                    key={tag.key}
                    ref={group === TAG_GROUPS[0] && tagIndex === 0 ? firstTagRef : undefined}
                    type="button"
                    variant={isSelected ? "secondary" : "outline"}
                    size="small"
                    aria-pressed={isSelected}
                    disabled={isTagDisabled?.(tag.key)}
                    onClick={() => onToggleTag(tag.key)}
                    className={`min-h-9! rounded-full! px-3! py-1! ${
                      isSelected ? "border border-green-500 bg-green-100" : ""
                    }`}
                  >
                    {tag.label}
                  </Button>
                );
              })}
            </div>
            {tags.length > DEFAULT_VISIBLE_TAG_COUNT ? (
              <Button
                type="button"
                variant="ghost"
                size="small"
                aria-expanded={isExpanded}
                rightIcon={
                  displayMode === "categories" ? (
                    <ChevronRightIcon
                      className={`transition-transform ${
                        isExpanded ? "-rotate-90" : "rotate-90"
                      }`}
                    />
                  ) : undefined
                }
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
            ) : null}
          </fieldset>
        );
      })}
    </div>
  );
}
