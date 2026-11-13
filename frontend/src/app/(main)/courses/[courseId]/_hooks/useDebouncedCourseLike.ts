"use client";

import { useEffect, useRef, useState } from "react";

import { useLikeCourse, useUnlikeCourse } from "@/api/course/course.query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const COURSE_LIKE_SYNC_DELAY = 300;

type LikeIntent = Readonly<{
  isLiked: boolean;
  version: number;
}>;

type SyncedLikeState = Readonly<{
  isLiked: boolean;
  likeCount: number;
}>;

type UseDebouncedCourseLikeParams = Readonly<{
  courseId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}>;

type UseDebouncedCourseLikeResult = Readonly<{
  isLiked: boolean;
  likeCount: number;
  isLikePending: boolean;
  hasLikeError: boolean;
  onLikeToggle: () => void;
}>;

/** 코스 좋아요를 화면에 즉시 반영하고 마지막 입력만 서버에 저장합니다. */
export function useDebouncedCourseLike({
  courseId,
  initialIsLiked,
  initialLikeCount,
}: UseDebouncedCourseLikeParams): UseDebouncedCourseLikeResult {
  const { mutateAsync: likeCourseAsync } = useLikeCourse();
  const { mutateAsync: unlikeCourseAsync } = useUnlikeCourse();

  const initialIntent: LikeIntent = {
    isLiked: initialIsLiked,
    version: 0,
  };

  const [likeIntent, setLikeIntent] = useState(initialIntent);

  const [syncedLikeState, setSyncedLikeState] = useState<SyncedLikeState>({
    isLiked: initialIsLiked,
    likeCount: initialLikeCount,
  });

  const [isLikePending, setIsLikePending] = useState(false);
  const [hasLikeError, setHasLikeError] = useState(false);

  const debouncedLikeIntent = useDebouncedValue(
    likeIntent,
    COURSE_LIKE_SYNC_DELAY,
  );

  const latestIntentRef = useRef(initialIntent);
  const requestInFlightRef = useRef(false);
  const failedIntentVersionRef = useRef<number | null>(null);

  useEffect(() => {
    if (requestInFlightRef.current) {
      return;
    }

    if (debouncedLikeIntent.isLiked === syncedLikeState.isLiked) {
      return;
    }

    if (failedIntentVersionRef.current === debouncedLikeIntent.version) {
      return;
    }

    const targetIntent = debouncedLikeIntent;

    /** 디바운스가 끝난 최종 좋아요 상태를 서버와 동기화합니다. */
    const syncCourseLike = async () => {
      requestInFlightRef.current = true;
      setIsLikePending(true);

      try {
        const result = targetIntent.isLiked
          ? await likeCourseAsync(courseId)
          : await unlikeCourseAsync(courseId);

        setSyncedLikeState({
          isLiked: result.isLiked,
          likeCount: result.likeCount,
        });
      } catch {
        const latestIntent = latestIntentRef.current;

        if (latestIntent.version === targetIntent.version) {
          const rollbackIntent = {
            isLiked: syncedLikeState.isLiked,
            version: targetIntent.version,
          };

          failedIntentVersionRef.current = targetIntent.version;
          latestIntentRef.current = rollbackIntent;

          setLikeIntent(rollbackIntent);
          setHasLikeError(true);
        }
      } finally {
        requestInFlightRef.current = false;
        setIsLikePending(false);
      }
    };

    void syncCourseLike();
  }, [
    courseId,
    debouncedLikeIntent,
    likeCourseAsync,
    syncedLikeState,
    unlikeCourseAsync,
  ]);

  /** 클릭할 때마다 새 입력 버전을 만들어 디바운스 시간을 다시 시작합니다. */
  const handleLikeToggle = () => {
    setHasLikeError(false);
    failedIntentVersionRef.current = null;

    setLikeIntent((currentIntent) => {
      const nextIntent = {
        isLiked: !currentIntent.isLiked,
        version: currentIntent.version + 1,
      };

      latestIntentRef.current = nextIntent;

      return nextIntent;
    });
  };

  const likeCount = Math.max(
    0,
    syncedLikeState.likeCount +
      Number(likeIntent.isLiked) -
      Number(syncedLikeState.isLiked),
  );

  return {
    isLiked: likeIntent.isLiked,
    likeCount,
    isLikePending,
    hasLikeError,
    onLikeToggle: handleLikeToggle,
  };
}
