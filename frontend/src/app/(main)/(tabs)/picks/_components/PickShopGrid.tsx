import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

import { PickShopCard, type PickShop } from "./PickShopCard";
import { PicksSkeleton } from "./PicksSkeleton";

type Props = Readonly<{
  shops: PickShop[];
  isAll: boolean;
  isPending: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
}>;

/**
 * 목록과 무한스크롤
 */

/**
 *
 * @param param0
 * @returns
 */
export function PickShopGrid({
  shops,
  isAll,
  isPending,
  isError,
  isFetchingNextPage,
  hasNextPage,
  onRetry,
  onLoadMore,
}: Props) {
  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore,
    hasNextPage,
    isLoading: isFetchingNextPage,
    rootMargin: "200px",
  });

  if (isPending) {
    return <PicksSkeleton />;
  }

  if (isError) {
    return (
      <StatePanel
        title="내 픽을 불러오지 못했어요"
        action="다시 시도"
        onAction={onRetry}
      />
    );
  }

  if (shops.length === 0) {
    return (
      <StatePanel
        title={
          isAll
            ? "아직 픽한 상점이 없어요"
            : "아직 이 폴더에 담긴 상점이 없어요"
        }
        action=""
      />
    );
  }

  return (
    <>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-5">
        {shops.map((shop) => (
          <PickShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {hasNextPage ? (
        <div ref={loadMoreRef} className="h-8" aria-hidden="true" />
      ) : null}

      {isFetchingNextPage ? <NextPageSkeleton /> : null}
    </>
  );
}

function NextPageSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
      <Skeleton announce={false} className="aspect-square rounded-2xl" />

      <Skeleton announce={false} className="aspect-square rounded-2xl" />
    </div>
  );
}
