"use client";

import {
  SHOP_REGION_GROUP_LABELS,
  VISIT_LOG_CONTENT_MAX_LENGTH,
  isApiError,
  type CreateVisitLogRequest,
  type ShopCategory,
  type TagKey,
} from "@sopum-map/shared";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, type SubmitEvent } from "react";

import { useShopDetail } from "@/api/shops/shop.query";
import {
  useCheckVisitLogAvailability,
  useCreateVisitLog,
} from "@/api/visit-log/visit-log.query";
import { Button } from "@/components/ui/Button";
import { DatePickerSheet } from "@/components/ui/DatePickerSheet";
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
  isAvailabilityPending: boolean;
  isPending: boolean;
  onBack: () => void;
  onCheckAvailability: (
    visitedAt: string,
  ) => Promise<Readonly<{ canCreate: boolean }>>;
  onSubmit: (input: CreateVisitLogRequest) => Promise<void>;
}>;

type VisitLogStep = 1 | 2 | 3;

/** 방문 로그 입력을 검증하고 이미지 없는 작성 요청으로 변환합니다. */
export function VisitLogCreateForm({
  shop,
  initialDateValue = getTodayDateInputValue(),
  isAvailabilityPending,
  isPending,
  onBack,
  onCheckAvailability,
  onSubmit,
}: FormProps) {
  const [step, setStep] = useState<VisitLogStep>(1);
  const [dateValue, setDateValue] = useState(initialDateValue);
  const [selectedTagKeys, setSelectedTagKeys] = useState<readonly TagKey[]>([]);
  const [content, setContent] = useState("");
  const [tagError, setTagError] = useState("");
  const [dateError, setDateError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const firstTagRef = useRef<HTMLButtonElement>(null);

  /** 현재 단계에서 이전 화면으로 이동하고 첫 단계에서는 진입 화면으로 돌아갑니다. */
  const handleBack = () => {
    if (step === 1) {
      onBack();
      return;
    }

    setStep((current) => (current - 1) as VisitLogStep);
  };

  /** 방문일을 확인한 뒤 태그 선택 단계로 이동합니다. */
  const moveToTagStep = async () => {
    setDateError("");

    try {
      const visitedAt = toVisitLogIsoDate(dateValue);
      const availability = await onCheckAvailability(visitedAt);

      if (!availability.canCreate) {
        setDateError(
          "같은 날짜의 방문 로그가 이미 있어요. 다른 날짜를 선택해 주세요.",
        );
        return;
      }

      setStep(2);
    } catch (error) {
      setDateError(
        error instanceof Error
          ? error.message
          : "방문일 중복 여부를 확인하지 못했어요.",
      );
    }
  };

  /** 태그가 하나 이상 선택됐을 때 기록 단계로 이동합니다. */
  const moveToContentStep = () => {
    if (selectedTagKeys.length === 0) {
      setTagError("태그를 1개 이상 선택해 주세요.");
      firstTagRef.current?.focus();
      return;
    }

    setTagError("");
    setStep(3);
  };

  /** 입력값을 확인하고 작성 요청을 전달합니다. */
  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDateError("");
    setTagError("");
    setSubmitError("");

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
      setSubmitError(getVisitLogSubmitError(error));
    }
  };

  return (
    <main className="min-h-dvh bg-white pb-28">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-center border-b border-black-100 bg-white px-5">
        <Button
          variant="ghost"
          size="small"
          iconOnly
          aria-label={
            step === 1 ? "상점 상세로 돌아가기" : "이전 단계로 돌아가기"
          }
          onClick={handleBack}
          className="absolute left-3 text-24"
        >
          ‹
        </Button>
        <h1 className="text-18 font-semibold">방문 로그 작성 · {step}/3</h1>
      </header>

      <form onSubmit={(event) => void handleSubmit(event)} noValidate>
        {step === 1 && (
          <div className="space-y-2 px-5 py-5">
            <h2 className="text-18 font-semibold">방문한 소품샵과 방문일</h2>
            <div className="flex items-center gap-4 rounded-card bg-green-100/70 p-4">
              <Image
                src={shop.mainImageUrl ?? DEFAULT_IMAGES.shop}
                alt=""
                width={80}
                height={80}
                loading="eager"
                className="size-20 shrink-0 rounded-card object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-16 font-bold text-black-950">
                  {shop.name}
                </p>
                <p className="mt-1 text-13 text-green-700">
                  {shop.regionLabel} · {shop.category}
                </p>
              </div>
            </div>
            <DatePickerSheet
              label="방문일"
              value={dateValue}
              maxDateValue={getTodayDateInputValue()}
              errorMessage={dateError || undefined}
              onChange={(nextDateValue) => {
                setDateValue(nextDateValue);
                setDateError("");
              }}
            />
          </div>
        )}

        {step === 2 && (
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
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6 px-5 py-5">
            <div>
              <h2 className="text-16 font-semibold">
                오늘 발견한 소품을 보여주세요
              </h2>
              <p className="mt-1 text-13 text-black-500">
                사진을 추가하면 더 생생한 로그가 돼요 (선택)
              </p>
              <Button type="button" variant="outline" disabled className="mt-3">
                사진 추가 준비 중
              </Button>
            </div>
            <Textarea
              label="방문 내용 (선택)"
              value={content}
              maxLength={VISIT_LOG_CONTENT_MAX_LENGTH}
              showCharacterCount
              disabled={isPending}
              placeholder={`${shop.name}에서의 경험을 남겨 주세요.`}
              textareaClassName="min-h-40"
              onChange={(event) => setContent(event.target.value)}
            />
            <p className="text-12 text-black-500">
              기록한 방문 로그는 모두에게 공개됩니다.
            </p>
            <p className="text-13 text-black-700">
              나의 기록도 쌓이고, 다른 소품 수집가에게도 도움이 돼요.
            </p>
          </section>
        )}

        {submitError && (
          <p role="alert" className="px-5 pb-4 text-13 text-red-600">
            {submitError}
          </p>
        )}

        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[480px] border-t border-black-100 bg-white p-4 safe-area-pb">
          {step === 1 && (
            <Button
              type="button"
              fullWidth
              size="large"
              isLoading={isAvailabilityPending}
              disabled={isAvailabilityPending}
              onClick={() => void moveToTagStep()}
            >
              다음 · 태그 선택
            </Button>
          )}
          {step === 2 && (
            <Button
              type="button"
              fullWidth
              size="large"
              onClick={moveToContentStep}
            >
              다음 · 사진과 기록
            </Button>
          )}
          {step === 3 && (
            <Button
              type="submit"
              fullWidth
              size="large"
              isLoading={isPending}
              disabled={isPending}
            >
              내 방문 로그에 기록하기
            </Button>
          )}
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

/** 코스 상세 한 단계로만 복귀할 수 있게 내부 경로를 제한합니다. */
export function parseCourseReturnPath(returnTo: string | null): string | null {
  if (!returnTo || !/^\/courses\/[A-Za-z0-9_-]+$/.test(returnTo)) {
    return null;
  }

  return returnTo;
}

/** 방문 로그 API 오류를 작성 화면에서 실행 가능한 안내로 바꿉니다. */
export function getVisitLogSubmitError(error: unknown): string {
  if (isApiError(error) && error.code === "VISIT_LOG_ALREADY_EXISTS") {
    return "같은 날짜의 방문 로그가 이미 있어요. 다른 날짜를 선택해 주세요.";
  }

  return error instanceof Error
    ? error.message
    : "방문 로그를 등록하지 못했어요.";
}

/** 실제 상점 데이터와 방문 로그 작성 API를 작성 폼에 연결합니다. */
export function VisitLogCreateScreen({
  shopId,
  onBackOverride,
}: Readonly<{ shopId: string; onBackOverride?: () => void }>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseReturnPath = parseCourseReturnPath(searchParams.get("returnTo"));
  const shopQuery = useShopDetail(shopId);
  const availabilityMutation = useCheckVisitLogAvailability(shopId);
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
      <main
        className="grid min-h-dvh place-items-center px-5 text-center"
        role="status"
      >
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
      isAvailabilityPending={availabilityMutation.isPending}
      isPending={createMutation.isPending}
      onCheckAvailability={(visitedAt) =>
        availabilityMutation.mutateAsync(visitedAt)
      }
      onBack={() => {
        if (onBackOverride) {
          onBackOverride();
          return;
        }

        if (courseReturnPath) {
          router.replace(courseReturnPath);
          return;
        }

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
          router.replace(
            courseReturnPath ?? `/shops/${shopId}?visitLogCreated=true`,
          );
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
      <Skeleton announce={false} className="h-20 rounded-card" />
      <Skeleton announce={false} className="h-36 rounded-card" />
      <Skeleton announce={false} className="h-40 rounded-card" />
    </main>
  );
}
