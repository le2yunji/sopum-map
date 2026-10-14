"use client";

import type {
  CreateVisitLogRequest,
  ShopCategory,
  TagKey,
} from "@sopum-map/shared";
import { SHOP_REGION_GROUP_LABELS } from "@sopum-map/shared";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { useShopDetail } from "@/api/shops/shop.query";
import { useCreateVisitLog } from "@/api/visit-log/visit-log.query";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { DEFAULT_IMAGES } from "@/constants/image.constants";

import { getTodayDateInputValue, toVisitLogIsoDate } from "./visit-log-date";
import { VisitLogTagSelector } from "./VisitLogTagSelector";

type ShopSummary = Readonly<{
  id: string;
  name: string;
  category: ShopCategory;
  regionLabel: string;
  mainImageUrl: string | null;
}>;

type FormProps = Readonly<{
  shop: ShopSummary;
  initialDateValue?: string;
  isPending: boolean;
  onBack: () => void;
  onSubmit: (input: CreateVisitLogRequest) => Promise<void>;
}>;

/** 방문 로그 입력을 검증하고 이미지 없는 작성 요청으로 변환합니다. */
export function VisitLogCreateForm({
  shop,
  initialDateValue = getTodayDateInputValue(),
  isPending,
  onBack,
  onSubmit,
}: FormProps) {
  const [dateValue, setDateValue] = useState(initialDateValue);
  const [selectedTagKeys, setSelectedTagKeys] = useState<readonly TagKey[]>([]);
  const [content, setContent] = useState("");
  const [tagError, setTagError] = useState("");
  const [dateError, setDateError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const firstTagRef = useRef<HTMLButtonElement>(null);

  /** 입력값을 확인하고 작성 요청을 전달합니다. */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDateError("");
    setTagError("");
    setSubmitError("");

    if (selectedTagKeys.length === 0) {
      setTagError("태그를 1개 이상 선택해 주세요.");
      firstTagRef.current?.focus();
      return;
    }

    let visitedAt: string;

    try {
      visitedAt = toVisitLogIsoDate(dateValue);
    } catch (error) {
      setDateError(
        error instanceof Error
          ? error.message
          : "방문일을 올바르게 입력해 주세요.",
      );
      return;
    }

    try {
      await onSubmit({
        visitedAt,
        selectedTagKeys,
        content: content.trim() || null,
        imageKeys: [],
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "방문 로그를 등록하지 못했어요.",
      );
    }
  };

  return (
    <main className="min-h-dvh bg-white pb-28">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-center border-b border-black-100 bg-white px-5">
        <Button
          variant="ghost"
          size="small"
          iconOnly
          aria-label="상점 상세로 돌아가기"
          onClick={onBack}
          className="absolute left-3 text-24"
        >
          ‹
        </Button>
        <h1 className="text-18 font-semibold">방문 로그 작성</h1>
      </header>

      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
        <section className="px-5 py-4">
          <div className="flex items-center gap-3 rounded-2xl bg-green-100/70 p-3">
            <Image
              src={shop.mainImageUrl ?? DEFAULT_IMAGES.shop}
              alt=""
              width={48}
              height={48}
              loading="eager"
              className="size-12 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <h2 className="truncate text-15 font-bold text-black-950">
                {shop.name}
              </h2>
              <p className="mt-0.5 text-12 text-green-700">
                {shop.regionLabel} · {shop.category}
              </p>
            </div>
          </div>
        </section>

        <div className="h-2 bg-black-100" />

        <section className="space-y-2 px-5 py-5">
          <label htmlFor="visit-log-date" className="block text-14 font-semibold">
            방문일
          </label>
          <input
            id="visit-log-date"
            type="date"
            value={dateValue}
            max={getTodayDateInputValue()}
            disabled={isPending}
            aria-invalid={Boolean(dateError)}
            aria-describedby={dateError ? "visit-log-date-error" : undefined}
            onChange={(event) => {
              setDateValue(event.target.value);
              setDateError("");
            }}
            className="min-h-12 w-full rounded-xl border border-black-200 px-4 text-14 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          />
          {dateError && (
            <p id="visit-log-date-error" role="alert" className="text-12 text-red-600">
              {dateError}
            </p>
          )}
        </section>

        <div className="h-2 bg-black-100" />

        <section className="px-5 py-5">
          <VisitLogTagSelector
            firstTagRef={firstTagRef}
            selectedTagKeys={selectedTagKeys}
            onChange={(nextTagKeys) => {
              setSelectedTagKeys(nextTagKeys);
              setTagError("");
            }}
            errorMessage={tagError || undefined}
          />
          <p className="mt-3 text-12 text-black-500">
            작성한 방문 로그는 다른 사용자에게 공개돼요.
          </p>
        </section>

        <div className="h-2 bg-black-100" />

        <section className="px-5 py-5">
          <Textarea
            label="방문 메모"
            value={content}
            maxLength={300}
            showCharacterCount
            disabled={isPending}
            placeholder={`${shop.name}에서의 경험을 남겨 주세요. 선택 입력이에요.`}
            textareaClassName="min-h-32"
            onChange={(event) => setContent(event.target.value)}
          />
        </section>

        {submitError && (
          <p role="alert" className="px-5 pb-4 text-13 text-red-600">
            {submitError}
          </p>
        )}

        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px] border-t border-black-100 bg-white p-4 safe-area-pb">
          <Button type="submit" fullWidth size="large" isLoading={isPending} disabled={isPending}>
            방문 로그 등록하기
          </Button>
        </div>
      </form>
    </main>
  );
}

/** 같은 서비스 안에서 들어온 경우에만 브라우저 뒤로가기를 사용합니다. */
export function canReturnWithBrowserHistory(
  referrer: string,
  origin: string,
  shopId: string,
) {
  if (!referrer) {
    return false;
  }

  try {
    const previousUrl = new URL(referrer);

    return (
      previousUrl.origin === origin &&
      previousUrl.pathname === `/shops/${encodeURIComponent(shopId)}`
    );
  } catch {
    return false;
  }
}

/** 실제 상점 데이터와 방문 로그 작성 API를 작성 폼에 연결합니다. */
export function VisitLogCreateScreen({ shopId }: Readonly<{ shopId: string }>) {
  const router = useRouter();
  const shopQuery = useShopDetail(shopId);
  const createMutation = useCreateVisitLog(shopId);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (shopQuery.isPending) {
    return <VisitLogCreateSkeleton />;
  }

  if (shopQuery.isError || !shopQuery.data) {
    return (
      <StatePanel
        title="상점 정보를 불러오지 못했어요"
        action="다시 시도"
        onAction={() => void shopQuery.refetch()}
      />
    );
  }

  const shop = shopQuery.data;

  if (isSubmitted) {
    return (
      <main className="grid min-h-dvh place-items-center px-5 text-center" role="status">
        <p className="text-18 font-semibold">방문 로그를 등록했어요.</p>
      </main>
    );
  }

  return (
    <VisitLogCreateForm
      shop={{
        id: shop.id,
        name: shop.name,
        category: shop.category,
        regionLabel: SHOP_REGION_GROUP_LABELS[shop.regionGroup],
        mainImageUrl: shop.mainImageUrl,
      }}
      isPending={createMutation.isPending}
      onBack={() => {
        if (
          canReturnWithBrowserHistory(
            document.referrer,
            window.location.origin,
            shopId,
          )
        ) {
          router.back();
          return;
        }

        router.replace(`/shops/${shopId}`);
      }}
      onSubmit={async (input) => {
        await createMutation.mutateAsync(input);
        setIsSubmitted(true);
        window.setTimeout(() => {
          router.replace(`/shops/${shopId}?visitLogCreated=true`);
        }, 600);
      }}
    />
  );
}

/** 작성 화면의 주요 공간을 유지하는 로딩 상태입니다. */
export function VisitLogCreateSkeleton() {
  return (
    <main aria-busy="true" className="space-y-5 p-5">
      <Skeleton label="방문 로그 작성 화면을 불러오는 중" className="h-16" />
      <Skeleton announce={false} className="h-20 rounded-2xl" />
      <Skeleton announce={false} className="h-36 rounded-2xl" />
      <Skeleton announce={false} className="h-40 rounded-2xl" />
    </main>
  );
}
