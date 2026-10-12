"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import {
  useInfiniteLikedCourses,
  useInfiniteMyCourses,
  useUnlikeCourse,
} from "@/api/course/course.query";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Snackbar } from "@/components/ui/Snackbar";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";

import { CourseListCard } from "./CourseListCard";
import { LikedCourseListCard } from "./LikedCourseListCard";

type CourseTab = "mine" | "liked";

/** 내 코스와 찜한 코스의 페이지·빈 상태·추가 로딩을 탭별로 관리합니다. */
export function MyCoursesScreen() {
  const [activeTab, setActiveTab] = useState<CourseTab>("mine");
  const [notice, setNotice] = useState<string | null>(null);
  const myTabRef = useRef<HTMLButtonElement>(null);
  const likedTabRef = useRef<HTMLButtonElement>(null);
  const myCoursesQuery = useInfiniteMyCourses(activeTab === "mine");
  const likedCoursesQuery = useInfiniteLikedCourses(activeTab === "liked");
  const unlikeMutation = useUnlikeCourse();
  const activeQuery = activeTab === "mine" ? myCoursesQuery : likedCoursesQuery;
  const myCourses = myCoursesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const likedCourses = likedCoursesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => void activeQuery.fetchNextPage(),
    hasNextPage: Boolean(activeQuery.hasNextPage),
    isLoading: activeQuery.isFetchingNextPage,
  });

  /** 좌우·처음·끝 키로 탭 선택과 초점을 함께 옮깁니다. */
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const nextTab = event.key === "ArrowLeft" || event.key === "Home" ? "mine" : "liked";
    setActiveTab(nextTab);
    (nextTab === "mine" ? myTabRef : likedTabRef).current?.focus();
  };

  return (
    <section className="min-h-full bg-white px-5 pb-24 pt-12">
      <header>
        <p className="text-12 text-green-700">나의 코스</p>
        <h1 className="mt-1 text-24 font-semibold">산책 코스</h1>
      </header>

      <div role="tablist" aria-label="산책 코스 목록" className="mt-6 grid grid-cols-2 border-b border-stroke-subtle">
        <button
          ref={myTabRef}
          type="button"
          role="tab"
          id="my-courses-tab"
          aria-controls="my-courses-panel"
          aria-selected={activeTab === "mine"}
          tabIndex={activeTab === "mine" ? 0 : -1}
          onClick={() => setActiveTab("mine")}
          onKeyDown={handleTabKeyDown}
          className="min-h-12 border-b-2 px-3 text-14 font-semibold focus-visible:outline-2 focus-visible:outline-green-700 aria-selected:border-green-600 aria-selected:text-green-700 aria-[selected=false]:border-transparent aria-[selected=false]:text-black-500"
        >
          내 코스
        </button>
        <button
          ref={likedTabRef}
          type="button"
          role="tab"
          id="liked-courses-tab"
          aria-controls="liked-courses-panel"
          aria-selected={activeTab === "liked"}
          tabIndex={activeTab === "liked" ? 0 : -1}
          onClick={() => setActiveTab("liked")}
          onKeyDown={handleTabKeyDown}
          className="min-h-12 border-b-2 px-3 text-14 font-semibold focus-visible:outline-2 focus-visible:outline-green-700 aria-selected:border-green-600 aria-selected:text-green-700 aria-[selected=false]:border-transparent aria-[selected=false]:text-black-500"
        >
          찜한 코스
        </button>
      </div>

      <div
        role="tabpanel"
        id={activeTab === "mine" ? "my-courses-panel" : "liked-courses-panel"}
        aria-labelledby={activeTab === "mine" ? "my-courses-tab" : "liked-courses-tab"}
        className="pt-5"
      >
        {activeQuery.isPending ? (
          <div role="status" className="py-12 text-center text-14 text-black-500">코스를 불러오는 중...</div>
        ) : activeQuery.isError ? (
          <StatePanel
            title="코스를 불러오지 못했어요"
            action="다시 시도"
            onAction={() => void activeQuery.refetch()}
          />
        ) : activeTab === "mine" ? (
          myCourses.length > 0 ? (
            <div className="space-y-3">
              {myCourses.map((course) => <CourseListCard key={course.id} course={course} />)}
            </div>
          ) : (
            <StatePanel title="아직 만든 코스가 없어요" description="내 픽 폴더에서 나만의 코스를 만들어보세요." />
          )
        ) : likedCourses.length > 0 ? (
          <div className="space-y-3">
            {likedCourses.map((course) => (
              <LikedCourseListCard
                key={course.id}
                course={course}
                isUnlikePending={unlikeMutation.isPending && unlikeMutation.variables === course.id}
                onPrivateClick={() => setNotice("작성자가 비공개한 코스입니다.")}
                onUnlike={(courseId) => unlikeMutation.mutate(courseId)}
              />
            ))}
          </div>
        ) : (
          <StatePanel title="아직 찜한 코스가 없어요" description="마음에 드는 산책 코스를 찜해보세요." />
        )}

        {activeQuery.hasNextPage ? <div ref={loadMoreRef} className="h-8" aria-hidden="true" /> : null}
        {activeQuery.isFetchingNextPage ? <div role="status" className="py-4 text-center text-13 text-black-500">코스를 더 불러오는 중...</div> : null}
      </div>

      <Snackbar open={notice !== null} message={notice ?? ""} />
    </section>
  );
}
