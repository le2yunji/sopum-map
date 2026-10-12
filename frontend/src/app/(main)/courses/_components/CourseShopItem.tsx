"use client";

import Image from "next/image";

import type { CourseEditorShopOption } from "./CourseEditor";

import { Button } from "@/components/ui/Button";

type Props = Readonly<{
  shop: CourseEditorShopOption;

  selected: boolean;
  order: number | null;
  memo: string | null;

  isFirst: boolean;
  isLast: boolean;

  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMemoChange: (memo: string) => void;
}>;

export function CourseShopItem({
  shop,
  selected,
  order,
  memo,
  isFirst,
  isLast,
  onToggle,
  onMoveUp,
  onMoveDown,
  onMemoChange,
}: Props) {
  return (
    <article
      className="
        rounded-xl
        border border-black-100
        p-4
      "
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-pressed={selected}
          onClick={onToggle}
          className="
            flex min-w-0 flex-1
            items-center gap-3 text-left
          "
        >
          <span
            className={`
              flex size-7 shrink-0
              items-center justify-center
              rounded-full border
              text-12 font-semibold
              ${
                selected
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-black-300 text-black-400"
              }
            `}
          >
            {order ?? ""}
          </span>

          {shop.mainImageUrl ? (
            <div
              className="
                relative size-16 shrink-0
                overflow-hidden rounded-lg
                bg-black-50
              "
            >
              <Image
                src={shop.mainImageUrl}
                alt={shop.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="
                size-16 shrink-0
                rounded-lg bg-black-100
              "
            />
          )}

          <div className="min-w-0">
            <p className="truncate text-14 font-semibold">{shop.name}</p>

            <p className="mt-1 truncate text-12 text-black-500">
              {shop.address}
            </p>
          </div>
        </button>

        {selected ? (
          <div className="flex shrink-0 flex-col gap-1">
            <Button
              type="button"
              variant="ghost"
              size="small"
              disabled={isFirst}
              onClick={onMoveUp}
            >
              위
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="small"
              disabled={isLast}
              onClick={onMoveDown}
            >
              아래
            </Button>
          </div>
        ) : null}
      </div>

      {selected ? (
        <div className="mt-3">
          <textarea
            value={memo ?? ""}
            maxLength={300}
            rows={2}
            placeholder="이 상점에 대한 메모를 남겨보세요."
            onChange={(event) => {
              onMemoChange(event.target.value);
            }}
            className="
              w-full resize-none rounded-lg
              bg-black-50
              px-3 py-2
              text-12 outline-none
            "
          />

          <p className="mt-1 text-right text-11 text-black-400">
            {(memo ?? "").length}/300
          </p>
        </div>
      ) : null}
    </article>
  );
}
