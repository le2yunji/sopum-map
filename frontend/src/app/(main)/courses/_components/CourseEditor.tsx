"use client";

import { useEffect, useState } from "react";

import type { CourseShopInput } from "@sopum-map/shared";

import { ChevronLeftIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Snackbar } from "@/components/ui/Snackbar";

import { CourseShopItem } from "./CourseShopItem";

const MAX_COURSE_SHOPS = 10;
const MIN_COURSE_SHOPS = 2;

export type CourseEditorSubmitData = Readonly<{
  title: string;
  description: string | null;
  isPublic: boolean;
  shops: readonly CourseShopInput[];
}>;

export type CourseEditorShopOption = Readonly<{
  id: string;
  name: string;
  address: string;
  mainImageUrl: string | null;
}>;

type Props = Readonly<{
  heading: string;

  initialTitle: string;
  initialDescription: string;
  initialIsPublic?: boolean;
  initialSelectedShops: readonly CourseShopInput[];

  shops: readonly CourseEditorShopOption[];

  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isSubmitting: boolean;

  submitLabel: string;
  showVisibilityControl?: boolean;
  onExit?: () => void;

  onLoadMore: () => void;
  onSubmit: (data: CourseEditorSubmitData) => Promise<void>;

  isOptimizing?: boolean;

  onOptimize?: (
    selectedShopIds: readonly string[],
    startShopId?: string,
  ) => Promise<readonly string[]>;
}>;

export function CourseEditor({
  heading,
  initialTitle,
  initialDescription,
  initialIsPublic = false,
  initialSelectedShops,
  shops,
  hasNextPage,
  isFetchingNextPage,
  isSubmitting,
  submitLabel,
  showVisibilityControl = false,
  onExit,
  onLoadMore,
  onSubmit,
  isOptimizing = false,
  onOptimize,
}: Props) {
  const [title, setTitle] = useState(initialTitle);

  const [description, setDescription] = useState(initialDescription);
  const [isPublic, setIsPublic] = useState(initialIsPublic);

  const [selectedShops, setSelectedShops] = useState<CourseShopInput[]>(() => [
    ...initialSelectedShops,
  ]);
  const [startShopId, setStartShopId] = useState<string | undefined>();

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!snackbarMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSnackbarMessage(null);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [snackbarMessage]);

  const handleOptimize = async () => {
    if (!onOptimize || selectedShops.length < MIN_COURSE_SHOPS) {
      return;
    }

    try {
      const orderedShopIds = await onOptimize(
        selectedShops.map((shop) => shop.shopId),
        startShopId,
      );

      const selectedShopById = new Map(
        selectedShops.map((shop) => [shop.shopId, shop]),
      );

      const reorderedShops = orderedShopIds
        .map((shopId, index) => {
          const shop = selectedShopById.get(shopId);

          if (!shop) {
            return null;
          }

          return {
            ...shop,
            order: index + 1,
          };
        })
        .filter((shop) => shop !== null);

      setSelectedShops(reorderedShops);

      setSnackbarMessage("추천 방문 순서로 정렬했어요.");
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error
          ? error.message
          : "추천 순서를 계산하지 못했어요.",
      );
    }
  };

  /**
   * 상점을 코스에 추가하거나 제거합니다.
   */
  const handleToggleShop = (shopId: string) => {
    const isSelected = selectedShops.some((shop) => shop.shopId === shopId);

    if (isSelected) {
      if (startShopId === shopId) {
        setStartShopId(undefined);
      }
      setSelectedShops((current) =>
        current
          .filter((shop) => shop.shopId !== shopId)
          .map((shop, index) => ({
            ...shop,
            order: index + 1,
          })),
      );

      return;
    }

    if (selectedShops.length >= MAX_COURSE_SHOPS) {
      setSnackbarMessage("코스에는 최대 10개의 상점만 담을 수 있어요.");

      return;
    }

    setSelectedShops((current) => [
      ...current,
      {
        shopId,
        order: current.length + 1,
        memo: null,
      },
    ]);
  };

  /** 기존 코스 수정 화면에서는 저장된 방문 순서를 직접 조정합니다. */
  const handleMoveShop = (shopId: string, direction: "up" | "down") => {
    setSelectedShops((current) => {
      const currentIndex = current.findIndex((shop) => shop.shopId === shopId);
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];

      return next.map((shop, index) => ({ ...shop, order: index + 1 }));
    });
  };

  /**
   * 상점별 메모를 수정합니다.
   */
  const handleMemoChange = (shopId: string, memo: string) => {
    setSelectedShops((current) =>
      current.map((shop) =>
        shop.shopId === shopId
          ? {
              ...shop,
              memo: memo.length > 0 ? memo : null,
            }
          : shop,
      ),
    );
  };

  /**
   * 입력값을 검증한 후 상위 화면에 저장을 요청합니다.
   */
  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setSnackbarMessage("코스 이름을 입력해주세요.");

      return;
    }

    if (selectedShops.length < MIN_COURSE_SHOPS) {
      setSnackbarMessage("코스에는 최소 2개의 상점이 필요해요.");

      return;
    }

    try {
      await onSubmit({
        title: trimmedTitle,

        description: trimmedDescription.length > 0 ? trimmedDescription : null,

        isPublic,

        shops: selectedShops,
      });
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "코스를 저장하지 못했어요.",
      );
    }
  };

  return (
    <section className="min-h-full bg-white px-5 pb-32 pt-16">
      <header>
        {onExit || showVisibilityControl ? (
          <div className="mb-6 flex items-center justify-between">
            {onExit ? (
              <button
                type="button"
                aria-label="코스 만들기 나가기"
                onClick={onExit}
                className="grid size-11 place-items-center rounded-full text-black-700 focus-visible:outline-2 focus-visible:outline-green-700"
              >
                <ChevronLeftIcon className="size-6" aria-hidden="true" />
              </button>
            ) : (
              <span />
            )}

            {showVisibilityControl ? (
              <button
                type="button"
                role="switch"
                aria-checked={isPublic}
                onClick={() => setIsPublic((current) => !current)}
                className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-13 font-semibold focus-visible:outline-2 focus-visible:outline-green-700"
              >
                <span>{isPublic ? "공개" : "비공개"}</span>
                <span
                  aria-hidden="true"
                  className={`relative h-6 w-11 rounded-full transition-colors ${isPublic ? "bg-green-600" : "bg-black-300"}`}
                >
                  <span
                    className={`absolute top-1 size-4 rounded-full bg-white transition-transform ${isPublic ? "translate-x-6" : "translate-x-1"}`}
                  />
                </span>
              </button>
            ) : null}
          </div>
        ) : null}

        <h1 className="text-24 font-semibold">{heading}</h1>
      </header>

      <div className="mt-8">
        <label htmlFor="course-title" className="text-14 font-semibold">
          코스 이름
        </label>

        <input
          id="course-title"
          value={title}
          maxLength={100}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          className="
            mt-2 w-full rounded-lg
            border border-black-200
            px-3 py-3
            text-14 outline-none
          "
        />

        <p className="mt-1 text-right text-11 text-black-400">
          {title.length}/100
        </p>
      </div>

      <div className="mt-6">
        <label htmlFor="course-description" className="text-14 font-semibold">
          설명
        </label>

        <textarea
          id="course-description"
          value={description}
          maxLength={1000}
          rows={4}
          placeholder="코스에 대한 설명을 입력해주세요."
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          className="
            mt-2 w-full resize-none rounded-lg
            border border-black-200
            px-3 py-3
            text-14 outline-none
          "
        />

        <p className="mt-1 text-right text-11 text-black-400">
          {description.length}/1000
        </p>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-16 font-semibold">코스 상점</h2>

          <span className="text-12 text-black-500">
            {selectedShops.length}/{MAX_COURSE_SHOPS}
          </span>
        </div>

        <p className="mt-1 text-12 text-black-500">
          {onOptimize
            ? "방문할 상점과 첫 방문 상점을 선택해주세요. 나머지는 최적 순서로 정렬해요."
            : "방문할 상점을 선택하고 순서를 정해주세요."}
        </p>

        {onOptimize ? (
          <Button
            type="button"
            variant="outline"
            fullWidth
            isLoading={isOptimizing}
            disabled={isOptimizing || selectedShops.length < MIN_COURSE_SHOPS}
            onClick={() => {
              void handleOptimize();
            }}
            className="mt-4"
          >
            추천 순서로 정렬
          </Button>
        ) : null}

        <div className="mt-4 space-y-3">
          {shops.map((shop) => {
            const selectedShop =
              selectedShops.find((item) => item.shopId === shop.id) ?? null;

            const selected = selectedShop !== null;

            return (
              <CourseShopItem
                key={shop.id}
                shop={shop}
                selected={selected}
                order={selectedShop?.order ?? null}
                memo={selectedShop?.memo ?? null}
                isStartShop={startShopId === shop.id}
                canChooseStartShop={Boolean(onOptimize)}
                isFirst={selectedShop?.order === 1}
                isLast={selectedShop?.order === selectedShops.length}
                onToggle={() => {
                  handleToggleShop(shop.id);
                }}
                onSetStartShop={() => {
                  setStartShopId((current) =>
                    current === shop.id ? undefined : shop.id,
                  );
                }}
                onMoveUp={() => handleMoveShop(shop.id, "up")}
                onMoveDown={() => handleMoveShop(shop.id, "down")}
                onMemoChange={(memo) => {
                  handleMemoChange(shop.id, memo);
                }}
              />
            );
          })}
        </div>

        {hasNextPage ? (
          <Button
            type="button"
            variant="outline"
            fullWidth
            isLoading={isFetchingNextPage}
            disabled={isFetchingNextPage}
            onClick={onLoadMore}
            className="mt-4"
          >
            상점 더 보기
          </Button>
        ) : null}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-white px-5 py-4">
        <div className="mx-auto max-w-[440px]">
          <Button
            type="button"
            fullWidth
            isLoading={isSubmitting}
            disabled={
              isSubmitting ||
              title.trim().length === 0 ||
              selectedShops.length < MIN_COURSE_SHOPS
            }
            onClick={() => {
              void handleSubmit();
            }}
          >
            {submitLabel}
          </Button>
        </div>
      </div>

      <Snackbar
        open={snackbarMessage !== null}
        message={snackbarMessage ?? ""}
      />
    </section>
  );
}
