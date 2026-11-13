import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type {
  HomeCourseRecommendationsData,
  PublicCourseListItem,
  ShopRegionGroup,
} from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { expect, userEvent, within } from "storybook/test";

import { courseKeys } from "@/api/course/course.query";
import { DEFAULT_IMAGES } from "@/constants/image.constants";
import { toKoreaDateKey } from "@/utils/korea-date";

import { HomeCourseSection } from "./HomeCourseSection";
import { HomeCourseSectionBoundary } from "./HomeCourseSectionBoundary";

type CourseFixtureParams = Readonly<{
  id: string;
  title: string;
  regionGroup: ShopRegionGroup;
}>;

/** 홈 추천 스토리에서 사용할 완전한 공개 코스 데이터를 만듭니다. */
function createCourseFixture({
  id,
  title,
  regionGroup,
}: CourseFixtureParams): PublicCourseListItem {
  return {
    id,
    courseType: "recommended",
    title,
    description: "천천히 걸으며 소품샵을 둘러보는 산책 코스",
    regionGroup,
    imageUrls: [DEFAULT_IMAGES.shop],
    representativeTagKeys: ["stationery", "cute"],
    author: {
      id: null,
      displayName: "소품지도",
      profileImageUrl: null,
      isService: true,
    },
    likeCount: 12,
    isOfficialPick: false,
    createdAt: "2026-11-13T00:00:00.000Z",
  };
}

const SUCCESS_DATA = {
  items: [
    createCourseFixture({
      id: "course-seongsu",
      title: "성수 소품 산책",
      regionGroup: "seongsu-seoulforest",
    }),
    createCourseFixture({
      id: "course-yeonnam",
      title: "연남 소품 산책",
      regionGroup: "hongdae-yeonnam",
    }),
    createCourseFixture({
      id: "course-mangwon",
      title: "망원 소품 산책",
      regionGroup: "mangwon",
    }),
  ],
} satisfies HomeCourseRecommendationsData;

const EMPTY_DATA = {
  items: [],
} satisfies HomeCourseRecommendationsData;

type HomeCourseStoryProps = Readonly<{
  data?: HomeCourseRecommendationsData;
}>;

/** 실제 React Query 흐름을 유지하면서 스토리별 초기 캐시를 제공합니다. */
function HomeCourseStory({ data }: HomeCourseStoryProps) {
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

    if (data) {
      client.setQueryData(courseKeys.home(toKoreaDateKey(new Date())), data);
    }

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <HomeCourseSection />
    </QueryClientProvider>
  );
}

/** Error Boundary가 잡아야 하는 렌더링 오류를 발생시킵니다. */
function ThrowingCourseSection(): ReactNode {
  throw new Error("코스 카드 렌더링 실패");
}

const meta = {
  title: "Pages/Home/HomeCourseSection",
  component: HomeCourseSection,
  parameters: {
    layout: "fullscreen",
  },
  render: () => <HomeCourseStory data={SUCCESS_DATA} />,
} satisfies Meta<typeof HomeCourseSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("link", { name: "더 보기" })).toHaveAttribute(
      "href",
      "/courses",
    );

    await expect(
      canvas.getAllByRole("link", { name: /코스 상세 보기/ }),
    ).toHaveLength(3);

    await expect(canvas.getByText("성수·서울숲")).toBeVisible();
    await expect(canvas.getByText("홍대·연남")).toBeVisible();
    await expect(canvas.getByText("망원")).toBeVisible();
  },
};

export const Empty: Story = {
  render: () => <HomeCourseStory data={EMPTY_DATA} />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("아직 공개된 산책 코스가 없습니다."),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => {
      return new Promise<Response>(() => undefined);
    };

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  render: () => <HomeCourseStory />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: "추천 코스를 불러오는 중",
      }),
    ).toBeVisible();
  },
};

export const ErrorAndRetry: Story = {
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
              code: "HOME_COURSE_FAILED",
              message: "추천 코스를 불러오지 못했습니다.",
            },
          },
          { status: 500 },
        );
      }

      return Response.json({
        success: true,
        data: SUCCESS_DATA,
      });
    };

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  render: () => <HomeCourseStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const retryButton = await canvas.findByRole("button", {
      name: "다시 시도",
    });

    await userEvent.click(retryButton);

    await expect(await canvas.findByText("성수 소품 산책")).toBeVisible();
  },
};

export const RenderErrorIsolation: Story = {
  render: () => (
    <div>
      <p>홈의 다른 콘텐츠</p>

      <HomeCourseSectionBoundary>
        <ThrowingCourseSection />
      </HomeCourseSectionBoundary>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("홈의 다른 콘텐츠")).toBeVisible();
    await expect(
      canvas.getByText("추천 코스를 표시하지 못했습니다."),
    ).toBeVisible();
  },
};
