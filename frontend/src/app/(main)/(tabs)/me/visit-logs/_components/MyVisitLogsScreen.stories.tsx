import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type {
  MyActivitySummaryData,
  MyVisitLogListData,
} from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { visitLogKeys } from "@/api/visit-log/visit-log.query";
import { meQueryKeys } from "@/api/me/me.query-keys";
import { MyVisitLogsScreen } from "./MyVisitLogsScreen";

const listData: MyVisitLogListData = {
  items: [
    {
      id: "log-1",
      shop: {
        id: "shop-1",
        name: "모모 소품샵",
        imageUrl: "/images/shops/shop_example.png",
        address: "서울 성동구 연무장길",
      },
      selectedTagKeys: ["keyrings", "cute"],
      content: "키링이 다양하고 천천히 구경하기 좋았어요.",
      images: [
        {
          key: "visit-log/log-1/photo-1",
          url: "/images/shops/shop_example.png",
        },
        {
          key: "visit-log/log-1/photo-2",
          url: "/images/shops/shop_example.png",
        },
      ],
      visitedAt: "2026-10-14T03:00:00.000Z",
      createdAt: "2026-10-14T04:00:00.000Z",
      updatedAt: "2026-10-14T04:00:00.000Z",
    },
    {
      id: "log-2",
      shop: {
        id: "shop-2",
        name: "초록 문방구",
        imageUrl: "/images/shops/shop_example.png",
        address: "서울 마포구 동교로",
      },
      selectedTagKeys: ["stickers"],
      content: null,
      images: [],
      visitedAt: "2026-10-12T03:00:00.000Z",
      createdAt: "2026-10-12T04:00:00.000Z",
      updatedAt: "2026-10-12T04:00:00.000Z",
    },
    {
      id: "log-3",
      shop: {
        id: "shop-3",
        name: "작은 선물가게",
        imageUrl: null,
        address: "서울 종로구 자하문로",
      },
      selectedTagKeys: ["stationery"],
      content: "차분한 분위기였어요.",
      images: [],
      visitedAt: "2026-10-10T03:00:00.000Z",
      createdAt: "2026-10-10T04:00:00.000Z",
      updatedAt: "2026-10-10T04:00:00.000Z",
    },
  ],
  pagination: {
    totalCount: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
  },
  summary: { totalCount: 3, uniqueShopCount: 3 },
};

const activitySummary = {
  createdCourseCount: 3,
  visitLogCount: 5,
  visitedShopCount: 2,
} satisfies MyActivitySummaryData;

/** 방문 로그 목록 데이터를 격리된 Query 캐시에 넣습니다. */
function VisitLogsStory({ empty = false }: Readonly<{ empty?: boolean }>) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    const page = empty
      ? {
          ...listData,
          items: [],
          pagination: { ...listData.pagination, totalCount: 0 },
          summary: { totalCount: 0, uniqueShopCount: 0 },
        }
      : listData;
    client.setQueryData(visitLogKeys.myLists(), {
      pages: [page],
      pageParams: [1],
    });
    client.setQueryData(
      meQueryKeys.activitySummary(),
      empty
        ? { ...activitySummary, visitLogCount: 0, visitedShopCount: 0 }
        : activitySummary,
    );
    return client;
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MyVisitLogsScreen />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Pages/MyVisitLogs",
  component: VisitLogsStory,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  args: { empty: false },
} satisfies Meta<typeof VisitLogsStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "내 방문 기록" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "이전 화면으로 돌아가기" }),
    ).toBeVisible();
    const createLink = canvas.getByRole("link", {
      name: "새 방문 로그 작성",
    });
    await expect(createLink).toHaveAttribute("href", "/visit-logs/new");
    await expect(createLink).not.toHaveClass("bg-green-100");
    await expect(canvas.getByLabelText("모은 순간 5개")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "방문한 상점 2곳 보기" }),
    ).toHaveAttribute("href", "/me/visited-shops");
    const photoLogLink = canvas.getByRole("link", {
      name: "모모 소품샵, 2026년 10월 14일 방문 로그 보기",
    });
    await expect(photoLogLink).toHaveAttribute("href", "/me/visit-logs/log-1");
    await expect(
      within(photoLogLink).getByLabelText("방문 사진 2장"),
    ).toHaveTextContent("2");

    const noPhotoLogLink = canvas.getByRole("link", {
      name: "초록 문방구, 2026년 10월 12일 방문 로그 보기",
    });
    await expect(noPhotoLogLink).toHaveAttribute(
      "href",
      "/me/visit-logs/log-2",
    );
    await expect(
      noPhotoLogLink.querySelector("img"),
    ).toHaveAttribute(
      "src",
      expect.stringContaining("visit-log-default.webp"),
    );
    await expect(
      within(noPhotoLogLink).queryByText("방문 사진 없음"),
    ).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { empty: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("아직 방문 로그가 없어요"),
    ).toBeVisible();
  },
};
export const SmallMobile: Story = {
  globals: { viewport: { value: "sopumSmall", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { name: "내 방문 기록" });
    const viewport = canvasElement.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();

    await expect(headingRect.right).toBeLessThanOrEqual(viewport.right);
  },
};
export const LargeMobile: Story = {
  globals: { viewport: { value: "sopumLarge", isRotated: false } },
};
