import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type {
  VisitedShopListData,
  VisitedShopListItem,
} from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { meQueryKeys } from "@/api/me/me.query-keys";

import TabsLayout from "../../../layout";
import { MyVisitedShopsScreen } from "./MyVisitedShopsScreen";

const VISITED_SHOP = {
  id: "shop-1",
  name: "모모 소품샵",
  category: "소품샵",
  tags: [
    {
      key: "keyrings",
      count: 3,
      label: "키링",
      group: "product",
    },
  ],
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
  lastVisitLogAt: "2026-11-07T03:00:00.000Z",
} satisfies VisitedShopListItem;

const OLDER_VISITED_SHOP = {
  ...VISITED_SHOP,
  id: "shop-2",
  name: "연남 문구점",
  regionGroup: "hongdae-yeonnam",
  tags: [
    {
      key: "stickers",
      count: 2,
      label: "스티커",
      group: "product",
    },
  ],
  lastVisitedAt: "2026-11-10T03:00:00.000Z",
  lastVisitLogAt: null,
} satisfies VisitedShopListItem;

const VISITED_SHOPS_PAGE = {
  items: [VISITED_SHOP, OLDER_VISITED_SHOP],
  pagination: {
    totalCount: 2,
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
    <TabsLayout>
      <QueryClientProvider client={queryClient}>
        <MyVisitedShopsScreen />
      </QueryClientProvider>
    </TabsLayout>
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
      canvas.getByRole("button", { name: "이전 화면으로 돌아가기" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "모모 소품샵 상세 보기" }),
    ).toHaveAttribute("href", "/shops/shop-1");
    await expect(
      canvas.getByText("마지막 방문 2026년 11월 15일"),
    ).toBeVisible();
    await expect(canvas.getByText("성수·서울숲")).toBeVisible();
    await expect(
      canvas.getByText("2026년 11월 7일 방문로그 작성"),
    ).toBeVisible();
    await expect(
      canvas.getByText("2026년 11월 10일 코스에서 방문 완료"),
    ).toBeVisible();
    await expect(
      canvas.getByLabelText("모모 소품샵 방문로그 작성됨"),
    ).toBeVisible();
    await expect(
      canvas.queryByLabelText("연남 문구점 방문로그 작성됨"),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText("#키링")).not.toBeInTheDocument();

    const shopLinks = canvas.getAllByRole("link", {
      name: /상세 보기/,
    });

    await expect(shopLinks[0]).toHaveAccessibleName(
      "모모 소품샵 상세 보기",
    );
    await expect(shopLinks[1]).toHaveAccessibleName(
      "연남 문구점 상세 보기",
    );

    const header = canvas
      .getByRole("heading", { name: "방문한 상점" })
      .closest("header");

    await expect(header).not.toBeNull();
    await expect(shopLinks[0].getBoundingClientRect().top).toBeGreaterThanOrEqual(
      header?.getBoundingClientRect().bottom ?? 0,
    );

    const documentElement = canvasElement.ownerDocument.documentElement;

    await expect(documentElement.scrollHeight).toBeLessThanOrEqual(
      documentElement.clientHeight,
    );
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
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("방문한 상점을 불러오는 중..."),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "이전 화면으로 돌아가기" }),
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
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText("방문한 상점을 불러오지 못했어요"),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "이전 화면으로 돌아가기" }),
    ).toBeVisible();
  },
};

export const SmallMobile: Story = {
  globals: { viewport: { value: "sopumSmall", isRotated: false } },
};

export const LargeMobile: Story = {
  globals: { viewport: { value: "sopumLarge", isRotated: false } },
};
