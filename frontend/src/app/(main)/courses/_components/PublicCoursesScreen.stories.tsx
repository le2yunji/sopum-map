import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import type {
  PublicCourseListData,
  PublicCourseListItem,
  ShopRegionGroup,
} from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { courseKeys } from "@/api/course/course.query";
import { DEFAULT_IMAGES } from "@/constants/image.constants";

import {
  parsePublicCourseSearchParams,
  type PublicCourseBrowseQuery,
} from "../_utils/public-course-search-params";
import { PublicCoursesScreen } from "./PublicCoursesScreen";

const DEFAULT_QUERY = {
  sort: "latest",
} satisfies PublicCourseBrowseQuery;

type CourseFixtureParams = Readonly<{
  id: string;
  title: string;
  regionGroup?: ShopRegionGroup;
}>;

/** 공개 코스 화면 상태를 검증할 완전한 카드 데이터를 만듭니다. */
function createCourseFixture({
  id,
  title,
  regionGroup = "seongsu-seoulforest",
}: CourseFixtureParams): PublicCourseListItem {
  return {
    id,
    courseType: "user_created",
    title,
    description: "천천히 걸으며 소품샵을 둘러보는 코스",
    regionGroup,
    imageUrls: [DEFAULT_IMAGES.shop],
    representativeTagKeys: ["stationery", "cute"],
    author: {
      id: `author-${id}`,
      displayName: "소품산책가",
      profileImageUrl: null,
      isService: false,
    },
    likeCount: 12,
    isOfficialPick: false,
    createdAt: "2026-11-13T00:00:00.000Z",
  };
}

/** 한 페이지 분량의 공개 코스 응답을 만듭니다. */
function createCoursePage(
  items: readonly PublicCourseListItem[],
  options: Readonly<{ hasNext?: boolean; nextCursor?: string | null }> = {},
): PublicCourseListData {
  return {
    items,
    hasNext: options.hasNext ?? false,
    nextCursor: options.nextCursor ?? null,
  };
}

/** fetch 호출에 전달된 값을 검증 가능한 URL 문자열로 바꿉니다. */
function toRequestUrl(request: RequestInfo | URL | undefined) {
  if (typeof request === "string") {
    return request;
  }

  if (request instanceof URL) {
    return request.toString();
  }

  return request?.url;
}

const ALL_LATEST_PAGE = createCoursePage([
  createCourseFixture({
    id: "course-all-latest",
    title: "전체 최신 코스",
  }),
]);

const MANGWON_LATEST_PAGE = createCoursePage([
  createCourseFixture({
    id: "course-mangwon-latest",
    title: "망원 최신 코스",
    regionGroup: "mangwon",
  }),
]);

const MANGWON_POPULAR_PAGE = createCoursePage([
  createCourseFixture({
    id: "course-mangwon-popular",
    title: "망원 인기 코스",
    regionGroup: "mangwon",
  }),
]);

type CachedPublicCourses = Readonly<{
  query: PublicCourseBrowseQuery;
  data: PublicCourseListData;
}>;

type PublicCoursesStoryProps = Readonly<{
  initialQuery?: PublicCourseBrowseQuery;
  cachedQueries?: readonly CachedPublicCourses[];
}>;

/** 실제 무한 쿼리 흐름을 유지하면서 스토리별 캐시를 제공합니다. */
function PublicCoursesStory({
  initialQuery = DEFAULT_QUERY,
  cachedQueries = [],
}: PublicCoursesStoryProps) {
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          retryOnMount: false,
          staleTime: Infinity,
        },
      },
    });

    for (const cachedQuery of cachedQueries) {
      client.setQueryData(courseKeys.publicList(cachedQuery.query), {
        pages: [cachedQuery.data],
        pageParams: [undefined],
      });
    }

    return client;
  });

  useEffect(() => {
    const router = getRouter();

    router.replace.mockImplementation((href) => {
      const url = new URL(String(href), "http://localhost");

      setActiveQuery(
        parsePublicCourseSearchParams({
          regionGroup: url.searchParams.getAll("regionGroup"),
          sort: url.searchParams.getAll("sort"),
        }),
      );
    });

    return () => {
      router.replace.mockReset();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PublicCoursesScreen initialQuery={activeQuery} />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Pages/PublicCourses",
  component: PublicCoursesStory,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    initialQuery: DEFAULT_QUERY,
    cachedQueries: [
      {
        query: DEFAULT_QUERY,
        data: ALL_LATEST_PAGE,
      },
    ],
  },
} satisfies Meta<typeof PublicCoursesStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("link", {
        name: "전체 최신 코스 코스 상세 보기",
      }),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(canvas.getByRole("combobox", { name: "정렬" })).toHaveValue(
      "latest",
    );
  },
};

export const FilterChanges: Story = {
  args: {
    cachedQueries: [
      {
        query: DEFAULT_QUERY,
        data: ALL_LATEST_PAGE,
      },
      {
        query: { regionGroup: "mangwon", sort: "latest" },
        data: MANGWON_LATEST_PAGE,
      },
      {
        query: { regionGroup: "mangwon", sort: "popular" },
        data: MANGWON_POPULAR_PAGE,
      },
    ],
  },
  beforeEach: () => {
    getRouter().replace.mockClear();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const router = getRouter();

    await userEvent.click(canvas.getByRole("button", { name: "망원" }));

    await expect(await canvas.findByText("망원 최신 코스")).toBeVisible();
    await expect(canvas.queryByText("전체 최신 코스")).not.toBeInTheDocument();
    await expect(router.replace).toHaveBeenCalledTimes(1);

    let destination = router.replace.mock.calls.at(-1)?.[0];
    let url = new URL(String(destination), "http://localhost");

    await expect(url.pathname).toBe("/courses");
    await expect(url.searchParams.get("regionGroup")).toBe("mangwon");
    await expect(url.searchParams.get("sort")).toBe("latest");

    await userEvent.selectOptions(
      canvas.getByRole("combobox", { name: "정렬" }),
      "popular",
    );

    await expect(await canvas.findByText("망원 인기 코스")).toBeVisible();
    await expect(canvas.queryByText("망원 최신 코스")).not.toBeInTheDocument();
    await expect(router.replace).toHaveBeenCalledTimes(2);

    destination = router.replace.mock.calls.at(-1)?.[0];
    url = new URL(String(destination), "http://localhost");

    await expect(url.searchParams.get("regionGroup")).toBe("mangwon");
    await expect(url.searchParams.get("sort")).toBe("popular");
  },
};

export const Empty: Story = {
  args: {
    cachedQueries: [
      {
        query: DEFAULT_QUERY,
        data: createCoursePage([]),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("아직 공개된 산책 코스가 없습니다."),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  args: {
    cachedQueries: [],
  },
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Promise<Response>(() => undefined);

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: "공개 코스를 불러오는 중",
      }),
    ).toBeVisible();
  },
};

export const ErrorAndRetry: Story = {
  args: {
    cachedQueries: [],
  },
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    let requestCount = 0;

    globalThis.fetch = async () => {
      requestCount += 1;

      if (requestCount === 1) {
        return Response.json(
          {
            success: false,
            error: {
              code: "PUBLIC_COURSE_FAILED",
              message: "공개 코스를 불러오지 못했습니다.",
            },
          },
          { status: 500 },
        );
      }

      return Response.json({
        success: true,
        data: ALL_LATEST_PAGE,
      });
    };

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const retryButton = await canvas.findByRole("button", {
      name: "다시 시도",
    });

    await userEvent.click(retryButton);

    await expect(await canvas.findByText("전체 최신 코스")).toBeVisible();
  },
};

const fetchNextPage = fn<(input: RequestInfo | URL) => Promise<Response>>(
  async () =>
    Response.json({
      success: true,
      data: createCoursePage([
        createCourseFixture({
          id: "course-next-page",
          title: "다음 페이지 코스",
          regionGroup: "seochon",
        }),
      ]),
    }),
);

export const LoadNextPageOnce: Story = {
  args: {
    cachedQueries: [
      {
        query: DEFAULT_QUERY,
        data: createCoursePage(ALL_LATEST_PAGE.items, {
          hasNext: true,
          nextCursor: "next-course-cursor",
        }),
      },
    ],
  },
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    fetchNextPage.mockClear();
    globalThis.fetch = fetchNextPage;

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText("다음 페이지 코스")).toBeVisible();

    await waitFor(() => {
      expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    const request = fetchNextPage.mock.calls[0]?.[0];
    const requestUrl = toRequestUrl(request);

    await expect(requestUrl).toContain("cursor=next-course-cursor");
  },
};

export const SmallMobile: Story = {
  globals: {
    viewport: {
      value: "sopumSmall",
      isRotated: false,
    },
  },
};

export const LargeMobile: Story = {
  globals: {
    viewport: {
      value: "sopumLarge",
      isRotated: false,
    },
  },
};
