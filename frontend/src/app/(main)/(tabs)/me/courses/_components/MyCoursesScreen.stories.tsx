import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { LikedCourseListData, MyCourseListData } from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { courseKeys } from "@/api/course/course.query";

import { MyCoursesScreen } from "./MyCoursesScreen";

const myCourses: MyCourseListData = {
  items: [
    {
      id: "my-course-1",
      title: "성수 소품 산책",
      description: "천천히 둘러보는 코스",
      regionGroup: "seongsu-seoulforest",
      sourceFolderId: "folder-1",
      shopCount: 4,
      mainImageUrl: null,
      isPublic: true,
      likeCount: 12,
      createdAt: "2026-10-12T00:00:00.000Z",
      updatedAt: "2026-10-12T00:00:00.000Z",
    },
  ],
  hasNext: false,
  nextCursor: null,
};

const likedCourses: LikedCourseListData = {
  items: [
    {
      id: "liked-course-1",
      isPrivate: false,
      title: "연남 문구 탐방",
      description: null,
      regionGroup: "hongdae-yeonnam",
      shopCount: 3,
      mainImageUrl: null,
      author: {
        id: "author-1",
        displayName: "문구수집가",
        profileImageUrl: null,
        isService: false,
      },
      likeCount: 8,
      likedAt: "2026-10-12T01:00:00.000Z",
    },
    {
      id: "liked-course-private",
      isPrivate: true,
      likedAt: "2026-10-12T00:00:00.000Z",
    },
  ],
  hasNext: false,
  nextCursor: null,
};

/** 내 코스와 찜 목록 페이지를 스토리용 Query 캐시에 넣습니다. */
function MyCoursesStory({ hasNext = false }: Readonly<{ hasNext?: boolean }>) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    client.setQueryData(courseKeys.myCourses(), {
      pages: [
        {
          ...myCourses,
          hasNext,
          nextCursor: hasNext ? "next-20" : null,
        },
      ],
      pageParams: [undefined],
    });
    client.setQueryData(courseKeys.likedCourses(), {
      pages: [likedCourses],
      pageParams: [undefined],
    });
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MyCoursesScreen />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Pages/MyCourses",
  component: MyCoursesStory,
  parameters: { layout: "fullscreen" },
  args: { hasNext: false },
} satisfies Meta<typeof MyCoursesStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TabsAndLists: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const myTab = canvas.getByRole("tab", { name: "내 코스" });
    const likedTab = canvas.getByRole("tab", { name: "찜한 코스" });

    await expect(myTab).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText("공개")).toBeVisible();
    await expect(canvas.getByText("좋아요 12")).toBeVisible();

    myTab.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(likedTab).toHaveFocus();
    await expect(likedTab).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText("by 문구수집가")).toBeVisible();
    await expect(canvas.getByText("좋아요 8")).toBeVisible();
    await expect(canvas.getByText("비공개 코스")).toBeVisible();
    await expect(canvas.queryByText("liked-course-private")).not.toBeInTheDocument();
  },
};

export const PrivateCourseNotice: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.includes("/me/liked-courses")) {
        return Response.json({
          success: true,
          data: {
            ...likedCourses,
            items: likedCourses.items.filter(
              (course) => course.id !== "liked-course-private",
            ),
          },
        });
      }

      return Response.json({
        success: true,
        data: {
          courseId: "liked-course-private",
          isLiked: false,
          likeCount: 0,
        },
      });
    };

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "찜한 코스" }));
    await userEvent.click(canvas.getByRole("button", { name: "비공개 코스 열기" }));
    await expect(canvas.getByText("작성자가 비공개한 코스입니다.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "비공개 코스 찜 해제" }));
    await expect(canvas.queryByRole("button", { name: "비공개 코스 열기" })).not.toBeInTheDocument();
  },
};

export const SmallMobile: Story = {
  globals: { viewport: { value: "sopumSmall", isRotated: false } },
};

export const LargeMobile: Story = {
  globals: { viewport: { value: "sopumLarge", isRotated: false } },
};

const fetchNextPage = fn<(input: RequestInfo | URL) => Promise<Response>>(
  async () =>
  Response.json({
    success: true,
    data: {
      items: [],
      hasNext: false,
      nextCursor: null,
    },
  }),
);

export const LoadNextPage: Story = {
  args: { hasNext: true },
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    fetchNextPage.mockClear();
    globalThis.fetch = fetchNextPage;

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async () => {
    await waitFor(() => expect(fetchNextPage).toHaveBeenCalled());
    const input = fetchNextPage.mock.calls[0]?.[0];
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input?.url;

    await expect(url).toContain("cursor=next-20");
  },
};
