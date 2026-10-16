import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CourseDetailData } from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { courseKeys } from "@/api/course/course.query";

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

/** 스토리별 코스 상세 데이터를 실제 Query 캐시에 넣습니다. */
function CourseDetailStory({ course }: Readonly<{ course: CourseDetailData }>) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    client.setQueryData(courseKeys.detail(course.id), course);
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <CourseDetailScreen courseId={course.id} />
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
    await expect(canvas.getByText("by 빵별일지")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "코스 공유" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "코스 좋아요" })).toBeVisible();
    await expect(canvas.getByText("12")).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "코스 더보기" })).not.toBeInTheDocument();
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
    await expect(canvas.getByRole("button", { name: "공개 상태 변경" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "코스 좋아요" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "코스 더보기" }));
    await expect(canvas.getByRole("button", { name: "코스 수정" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "코스 삭제" })).toBeVisible();
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
    await expect(canvas.getByRole("button", { name: "코스 좋아요" })).toBeVisible();
  },
};

export const ShopActions: Story = {
  args: { course: baseCourse },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "퍼먼트 메뉴" }));
    await expect(canvas.getByRole("button", { name: "상점 보기" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "길찾기" })).toBeVisible();
  },
};

export const PublicToPrivate: Story = {
  args: {
    course: { ...baseCourse, isOwner: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "공개 상태 변경" }));
    await expect(canvas.getByRole("heading", { name: "코스를 비공개로 바꿀까요?" })).toBeVisible();
  },
};

export const ShareFailure: Story = {
  args: { course: baseCourse },
  beforeEach: () => {
    const shareDescriptor = Object.getOwnPropertyDescriptor(navigator, "share");
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

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
      if (shareDescriptor) Object.defineProperty(navigator, "share", shareDescriptor);
      else Reflect.deleteProperty(navigator, "share");

      if (clipboardDescriptor) Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
      else Reflect.deleteProperty(navigator, "clipboard");
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "코스 공유" }));
    await expect(canvas.findByText("코스 링크를 공유하지 못했어요.")).resolves.toBeVisible();
  },
};
