"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

type UseInfiniteScrollOptions = Readonly<{
  /** 감지 지점에 도달했을 때 실행할 함수 */
  onLoadMore: () => void;

  /** 추가 데이터 존재 여부 */
  hasNextPage: boolean;

  /** 현재 추가 데이터를 불러오는 중인지 여부 */
  isLoading: boolean;

  /**
   * 별도의 스크롤 컨테이너가 있는 경우 지정합니다.
   * 생략하면 브라우저 viewport가 기준이 됩니다.
   */
  rootRef?: RefObject<Element | null>;

  /** 실제 끝에 도달하기 전에 미리 감지할 범위 */
  rootMargin?: string;
}>;

const DEFAULT_ROOT_MARGIN = "200px 0px";

/**
 * 감지 지점이 스크롤 영역에 접근하면
 * 다음 데이터 요청을 실행합니다.
 *
 * pagination이나 데이터 자체는 관리하지 않습니다.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasNextPage,
  isLoading,
  rootRef,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: UseInfiniteScrollOptions) {
  const [target, setTarget] = useState<Element | null>(null);

  /**
   * Observer를 다시 생성하지 않고
   * 최신 onLoadMore 함수를 참조하기 위해 사용합니다.
   */
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!target || !hasNextPage || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        onLoadMoreRef.current();
      },
      {
        root: rootRef?.current ?? null,
        rootMargin,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [target, hasNextPage, isLoading, rootRef, rootMargin]);

  /**
   * 실제 감지 대상 DOM을 등록합니다.
   */
  const loadMoreRef = useCallback((node: Element | null) => {
    setTarget(node);
  }, []);

  return {
    loadMoreRef,
  };
}
