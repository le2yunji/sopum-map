import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ShopListData } from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { shopQueryKeys, useInfiniteShops } from "@/api/shops/shop.query";

import { PickButton } from "./PickButton";
import { PickAction } from "./PickAction";

const fetchMock = fn<typeof fetch>();

/** Fetch 입력값에서 요청 URL을 읽습니다. */
function getRequestUrl(input: RequestInfo | URL) {
  if (typeof input === "string" || input instanceof URL) {
    return new URL(input);
  }

  return new URL(input.url);
}

const SHOP_QUERY = {
  category: "소품샵",
  limit: 10,
  sort: "latest",
} as const;

const SHOP_LIST_DATA = {
  items: [
    {
      id: "shop-1",
      name: "테스트 상점",
      category: "소품샵",
      address: "서울특별시 마포구 연남동",
      mainImageUrl: null,
      region1: "서울특별시",
      region2: "마포구",
      region3: "연남동",
      regionGroup: "hongdae-yeonnam",
      latitude: 37.5665,
      longitude: 126.978,
      status: "active",
      likeCount: 1,
      visitLogCount: 0,
      isLiked: true,
      tags: [],
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    totalCount: 1,
    totalPages: 1,
    hasNext: false,
  },
} satisfies ShopListData;

type PickActionStoryProps = Readonly<{
  initialIsLiked: boolean;
  observeShopList: boolean;
}>;

/** 스토리마다 독립된 Query 캐시에서 픽 동작을 실행합니다. */
function PickActionStory({
  initialIsLiked,
  observeShopList,
}: PickActionStoryProps) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });

    client.setQueryData(shopQueryKeys.list(SHOP_QUERY), {
      pages: [SHOP_LIST_DATA],
      pageParams: [1],
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {observeShopList ? <ShopListObserver /> : null}
      <PickAction shopId="shop-1" initialIsLiked={initialIsLiked}>
        {({ isLiked, isPending, onToggle }) => (
          <PickButton
            isLiked={isLiked}
            isPending={isPending}
            onToggleLike={onToggle}
          />
        )}
      </PickAction>
    </QueryClientProvider>
  );
}

/** 홈과 같은 활성 상점 목록 Query를 테스트 환경에 연결합니다. */
function ShopListObserver() {
  const { data } = useInfiniteShops(SHOP_QUERY);
  const shop = data?.pages[0]?.items[0];

  return (
    <output aria-label="상점 목록 좋아요 상태">
      관심 {String(shop?.isLiked)} · {shop?.likeCount ?? 0}
    </output>
  );
}

const meta = {
  title: "Components/Pick/PickAction",
  component: PickActionStory,
  args: {
    initialIsLiked: false,
    observeShopList: false,
  },
  beforeEach: () => {
    const originalFetch = globalThis.fetch;

    fetchMock.mockReset();
    globalThis.fetch = fetchMock;

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
} satisfies Meta<typeof PickActionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ClosedFolderSheet: Story = {
  play: async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 100));

    await expect(fetchMock).not.toHaveBeenCalled();
  },
};

export const UnlikeWithClosedFolderSheet: Story = {
  args: {
    initialIsLiked: true,
    observeShopList: true,
  },
  beforeEach: () => {
    fetchMock.mockResolvedValue(
      Response.json({
        success: true,
        data: {
          shopId: "shop-1",
          isLiked: false,
          likeCount: 0,
        },
      }),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "내 픽에서 제거" }),
    );
    await expect(
      await canvas.findByText("내 픽에서 삭제되었습니다"),
    ).toBeVisible();
    await expect(canvas.getByText("관심 false · 0")).toBeVisible();

    await expect(fetchMock).toHaveBeenCalledOnce();
    await expect(fetchMock.mock.calls[0]?.[0]).toContain(
      "/shops/shop-1/likes",
    );
  },
};

export const OpenFolderSheet: Story = {
  beforeEach: () => {
    fetchMock.mockImplementation(async (input) => {
      const url = getRequestUrl(input);

      if (url.pathname.endsWith("/shops/shop-1/likes")) {
        return Response.json({
          success: true,
          data: {
            shopId: "shop-1",
            isLiked: true,
            likeCount: 1,
          },
        });
      }

      if (url.pathname.endsWith("/me/pick-folders")) {
        return Response.json({ success: true, data: { items: [] } });
      }

      return Response.json({ success: true, data: { folderIds: [] } });
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "내 픽에 추가" }));
    await userEvent.click(
      await canvas.findByRole("button", { name: "폴더 변경" }),
    );
    await expect(
      await canvas.findByText("생성된 내 픽 폴더가 없습니다."),
    ).toBeVisible();

    const requestUrls = fetchMock.mock.calls.map(([input]) => String(input));

    await expect(
      requestUrls.filter((url) => url.endsWith("/me/pick-folders")),
    ).toHaveLength(1);
    await expect(
      requestUrls.filter((url) =>
        url.endsWith("/me/liked-shops/shop-1/folders"),
      ),
    ).toHaveLength(1);
  },
};
