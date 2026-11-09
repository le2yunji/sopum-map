import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CourseDetailData } from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { courseKeys } from "@/api/course/course.query";
import { courseRouteQueryKeys } from "@/api/course-route/course-route.query";

import { CourseDetailScreen } from "./CourseDetailScreen";

const baseCourse: CourseDetailData = {
  id: "seoul-forest-postcard",
  courseType: "user_created",
  sourceFolderId: "folder-1",
  title: "성수동이 처음이라면? 필수코스",
  description: "차분하게 걷기 좋은 소품샵 코스예요.",
  regionGroup: "seongsu-seoulforest",
  isPublic: true,
  author: {
    id: "author-1",
    displayName: "빵별일지",
    profileImageUrl: null,
    isService: false,
  },
  isOwner: false,
  likeCount: 12,
  isLiked: false,
  shops: [
    {
      id: "shop-1",
      name: "퍼먼트",
      address: "서울 성동구 성수동1가",
      mainImageUrl: null,
      regionGroup: "seongsu-seoulforest",
      latitude: 37.544,
      longitude: 127.037,
      status: "active",
      isUnavailable: false,
      isVisited: false,
      order: 1,
      memo: null,
      walkingDistanceFromPreviousMeters: null,
      walkingDurationFromPreviousSeconds: null,
    },
    {
      id: "shop-2",
      name: "하츠베이커리 성수점",
      address: "서울 성동구 성수동2가",
      mainImageUrl: null,
      regionGroup: "seongsu-seoulforest",
      latitude: 37.542,
      longitude: 127.039,
      status: "active",
      isUnavailable: false,
      isVisited: false,
      order: 2,
      memo: "엽서를 천천히 둘러보기",
      walkingDistanceFromPreviousMeters: 1400,
      walkingDurationFromPreviousSeconds: 1080,
    },
  ],
  createdAt: "2026-07-29T00:00:00.000Z",
  updatedAt: "2026-07-29T00:00:00.000Z",
};

type CourseDetailStoryProps = Readonly<{
  course: CourseDetailData;
  mapClientId?: string | null;
}>;

/** 스토리별 코스 상세 데이터와 지도 설정을 격리해 제공합니다. */
function CourseDetailStory({ course, mapClientId }: CourseDetailStoryProps) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    client.setQueryData(courseKeys.detail(course.id), course);
    client.setQueryData(courseRouteQueryKeys.walking(course.id), {
      totalDistanceMeters: 320,
      totalDurationSeconds: 240,
      coordinates: [
        { latitude: 37.544, longitude: 127.037 },
        { latitude: 37.543, longitude: 127.038 },
        { latitude: 37.542, longitude: 127.039 },
      ],
    });
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <CourseDetailScreen courseId={course.id} mapClientId={mapClientId} />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Pages/CourseDetail",
  component: CourseDetailStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CourseDetailStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OtherUserCourse: Story = {
  args: { course: baseCourse },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("region", { name: "코스 지도 화면" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("region", { name: "코스 정보" }),
    ).toBeVisible();
    await expect(canvas.getByText("성수·서울숲")).toBeVisible();
    await expect(
      canvas.getByText("차분하게 걷기 좋은 소품샵 코스예요."),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "코스 정보 접기" }),
    );
    await expect(
      canvas.queryByRole("region", { name: "코스 정보" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "코스 공유" }),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "코스 정보" }));
    await expect(
      canvas.getByRole("region", { name: "코스 정보" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "퍼먼트 메뉴" }),
    ).not.toBeInTheDocument();

    const sheetToggle = canvas.getByRole("button", {
      name: "방문 순서 펼치기",
    });

    await expect(sheetToggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(sheetToggle);
    const courseInfo = canvas.getByRole("region", { name: "코스 정보" });
    const visitOrderSheet = canvas.getByRole("region", {
      name: "코스 방문 순서",
    });
    await waitFor(() => {
      expect(
        Math.abs(
          visitOrderSheet.getBoundingClientRect().top -
            courseInfo.getBoundingClientRect().top,
        ),
      ).toBeLessThanOrEqual(1);
    });
    await expect(canvas.getByText("by 빵별일지")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "코스 공유" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "코스 좋아요" }),
    ).toBeVisible();
    await expect(canvas.getByText("12")).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "코스 더보기" }),
    ).not.toBeInTheDocument();
  },
};

export const LongContent: Story = {
  args: {
    course: {
      ...baseCourse,
      title:
        "성수동 골목을 천천히 걸으며 오래 기억하고 싶은 소품을 발견하는 산책 코스",
      description:
        "조용한 골목과 작은 가게를 차례로 둘러보는 코스예요. 각 상점에서 마음에 드는 소품을 천천히 살펴보고 서울숲까지 이어서 산책해 보세요. 설명이 길어져도 지도와 방문 순서를 가리지 않아야 합니다.",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const courseInfo = canvas.getByRole("region", { name: "코스 정보" });
    const courseInfoTop = courseInfo.getBoundingClientRect().top;
    await expect(courseInfo).toBeVisible();
    await expect(
      canvas.getByRole("heading", {
        name: "성수동 골목을 천천히 걸으며 오래 기억하고 싶은 소품을 발견하는 산책 코스",
      }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "코스 정보 접기" }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "방문 순서 펼치기" }),
    );
    const visitOrderSheet = canvas.getByRole("region", {
      name: "코스 방문 순서",
    });
    await waitFor(() => {
      expect(
        Math.abs(visitOrderSheet.getBoundingClientRect().top - courseInfoTop),
      ).toBeLessThanOrEqual(1);
    });
  },
};

export const MissingMapKey: Story = {
  args: { course: baseCourse, mapClientId: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("region", { name: "코스 지도 화면" }),
    ).toBeVisible();
    await expect(
      canvas.getByText("네이버 지도 설정이 필요해요."),
    ).toBeVisible();
  },
};

export const EmptyCourse: Story = {
  args: {
    course: {
      ...baseCourse,
      shops: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("아직 코스에 담긴 상점이 없습니다."),
    ).toBeVisible();
  },
};

export const MyCourse: Story = {
  args: {
    course: {
      ...baseCourse,
      isOwner: true,
      author: { ...baseCourse.author, displayName: "내 코스" },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const courseScreen = canvas.getByRole("region", {
      name: "코스 지도 화면",
    });
    const visitOrderSheet = canvas.getByRole("region", {
      name: "코스 방문 순서",
    });
    const visitOrderToggle = canvas.getByRole("button", {
      name: "방문 순서 펼치기",
    });
    const visitOrderHandle = visitOrderToggle.querySelector<HTMLElement>(
      '[aria-hidden="true"]',
    );
    if (!visitOrderHandle) {
      throw new Error("방문 순서 시트 손잡이를 찾을 수 없습니다.");
    }
    const collapsedVisitOrderHeight =
      courseScreen.getBoundingClientRect().bottom -
      visitOrderSheet.getBoundingClientRect().top;
    await expect(
      canvas.getByRole("button", { name: "공개 상태 변경" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "코스 좋아요" }),
    ).not.toBeInTheDocument();
    const moreButton = canvas.getByRole("button", { name: "코스 더보기" });
    await expect(moreButton.querySelector("svg")).toBeVisible();
    await userEvent.click(moreButton);
    await expect(
      canvas.getByRole("button", { name: "코스 수정" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "코스 삭제" }),
    ).toBeVisible();
    const moreDialog = canvas.getByRole("dialog", { name: "코스 더보기" });
    const moreSurface = moreDialog.firstElementChild;
    const moreHandle = moreDialog.querySelector<HTMLElement>(
      '[aria-hidden="true"]',
    );
    if (!(moreSurface instanceof HTMLElement) || !moreHandle) {
      throw new Error("코스 더보기 시트 표면을 찾을 수 없습니다.");
    }

    await waitFor(() => {
      expect(
        Math.abs(
          moreSurface.getBoundingClientRect().height -
            collapsedVisitOrderHeight,
        ),
      ).toBeLessThanOrEqual(1);
    });

    const visitOrderStyle = getComputedStyle(visitOrderSheet);
    const moreStyle = getComputedStyle(moreSurface);
    const visitOrderHandleStyle = getComputedStyle(visitOrderHandle);
    const moreHandleStyle = getComputedStyle(moreHandle);

    await expect(moreStyle.borderTopLeftRadius).toBe(
      visitOrderStyle.borderTopLeftRadius,
    );
    await expect(moreStyle.boxShadow).toBe(visitOrderStyle.boxShadow);
    await expect(moreStyle.paddingLeft).toBe(
      getComputedStyle(visitOrderToggle).paddingLeft,
    );
    await expect(moreHandleStyle.width).toBe(visitOrderHandleStyle.width);
    await expect(moreHandleStyle.height).toBe(visitOrderHandleStyle.height);
    await expect(moreHandleStyle.backgroundColor).toBe(
      visitOrderHandleStyle.backgroundColor,
    );
  },
};

export const RecommendedCourse: Story = {
  args: {
    course: {
      ...baseCourse,
      courseType: "recommended",
      sourceFolderId: null,
      author: {
        id: null,
        displayName: "소품지도",
        profileImageUrl: null,
        isService: true,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("by 소품지도")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "코스 좋아요" }),
    ).toBeVisible();
  },
};

export const ShopActions: Story = {
  args: { course: baseCourse },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "방문 순서 펼치기" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "퍼먼트 메뉴" }));
    await expect(
      canvas.getByRole("button", { name: "상점 보기" }),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: "길찾기" })).toBeVisible();
  },
};

export const PublicToPrivate: Story = {
  args: {
    course: { ...baseCourse, isOwner: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "공개 상태 변경" }),
    );
    await expect(
      canvas.getByRole("heading", { name: "코스를 비공개로 바꿀까요?" }),
    ).toBeVisible();
  },
};

export const ShareFailure: Story = {
  args: { course: baseCourse },
  beforeEach: () => {
    const shareDescriptor = Object.getOwnPropertyDescriptor(navigator, "share");
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard",
    );

    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => Promise.reject(new Error("share failed")),
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => Promise.reject(new Error("copy failed")),
      },
    });

    return () => {
      if (shareDescriptor)
        Object.defineProperty(navigator, "share", shareDescriptor);
      else Reflect.deleteProperty(navigator, "share");

      if (clipboardDescriptor)
        Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
      else Reflect.deleteProperty(navigator, "clipboard");
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "코스 공유" }));
    await expect(
      canvas.findByText("코스 링크를 공유하지 못했어요."),
    ).resolves.toBeVisible();
  },
};
