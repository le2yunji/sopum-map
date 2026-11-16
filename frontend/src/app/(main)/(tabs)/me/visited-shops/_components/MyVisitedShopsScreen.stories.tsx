import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type {
  VisitedShopListData,
  VisitedShopListItem,
} from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { meQueryKeys } from "@/api/me/me.query-keys";

import { MyVisitedShopsScreen } from "./MyVisitedShopsScreen";

const VISITED_SHOP = {
  id: "shop-1",
  name: "모모 소품샵",
  category: "소품샵",
  tags: [],
  address: "서울 성동구 연무장길 1",
  mainImageUrl: null,
  region1: "서울",
  region2: "성동구",
  region3: null,
  regionGroup: "seongsu-seoulforest",
  latitude: 37.544,
  longitude: 127.055,
  status: "active",
  likeCount: 12,
  visitLogCount: 3,
  isLiked: true,
  lastVisitedAt: "2026-11-15T03:00:00.000Z",
} satisfies VisitedShopListItem;

const VISITED_SHOPS_PAGE = {
  items: [VISITED_SHOP],
  pagination: {
    totalCount: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
  },
} satisfies VisitedShopListData;

type StoryMode = "default" | "empty" | "loading" | "error";

/** 방문 상점 화면의 서버 상태를 독립된 Query 캐시로 제공합니다. */
function MyVisitedShopsStory({ mode }: Readonly<{ mode: StoryMode }>) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, retryOnMount: false, staleTime: Infinity },
      },
    });

    if (mode === "default" || mode === "empty") {
      const page =
        mode === "empty"
          ? {
              items: [],
              pagination: {
                ...VISITED_SHOPS_PAGE.pagination,
                totalCount: 0,
                totalPages: 0,
              },
            }
          : VISITED_SHOPS_PAGE;

      client.setQueryData(meQueryKeys.visitedShops(), {
        pages: [page],
        pageParams: [1],
      });
    }

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MyVisitedShopsScreen />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Pages/MyVisitedShops",
  component: MyVisitedShopsStory,
  parameters: { layout: "fullscreen" },
  args: { mode: "default" },
} satisfies Meta<typeof MyVisitedShopsStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("heading", { name: "방문한 상점" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "모모 소품샵 상세 보기" }),
    ).toHaveAttribute("href", "/shops/shop-1");
    await expect(
      canvas.getByText("마지막 방문 2026년 11월 15일"),
    ).toBeVisible();
  },
};

export const Empty: Story = {
  args: { mode: "empty" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("아직 방문한 상점이 없어요"),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  args: { mode: "loading" },
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () => new Promise<Response>(() => undefined);

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("방문한 상점을 불러오는 중..."),
    ).toBeVisible();
  },
};

export const Error: Story = {
  args: { mode: "error" },
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      Response.json(
        {
          success: false,
          error: {
            code: "HTTP_ERROR",
            message: "API 요청에 실패했습니다.",
          },
        },
        { status: 500 },
      );

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        "방문한 상점을 불러오지 못했어요",
      ),
    ).toBeVisible();
  },
};

export const SmallMobile: Story = {
  globals: { viewport: { value: "sopumSmall", isRotated: false } },
};

export const LargeMobile: Story = {
  globals: { viewport: { value: "sopumLarge", isRotated: false } },
};
