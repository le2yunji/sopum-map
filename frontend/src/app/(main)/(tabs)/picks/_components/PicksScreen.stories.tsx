import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type {
  LikedShopListData,
  LikedShopListItem,
  PickFolderListItem,
} from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  likedShopQueryKeys,
  pickFolderQueryKeys,
} from "@/api/pick-folder/pick-folder.query";

import { PicksScreen } from "./PicksScreen";

const SHOP = {
  id: "shop-1",
  name: "도레미 상점",
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
  likedAt: "2026-11-14T00:00:00.000Z",
} satisfies LikedShopListItem;

const FOLDERS = [
  {
    id: "folder-1",
    title: "성수 산책",
    description: null,
    order: 0,
    shopCount: 1,
    courses: [],
  },
  {
    id: "folder-2",
    title: "주말에 갈 곳",
    description: null,
    order: 1,
    shopCount: 2,
    courses: [],
  },
] satisfies PickFolderListItem[];

const LIKED_SHOPS_PAGE = {
  items: [SHOP],
  pagination: {
    totalCount: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
  },
} satisfies LikedShopListData;

type PicksScreenStoryProps = Readonly<{
  cacheShopFolders?: boolean;
}>;

/** 실제 화면 쿼리를 유지하면서 스토리별 초기 서버 상태를 제공합니다. */
function PicksScreenStory({
  cacheShopFolders = true,
}: PicksScreenStoryProps) {
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

    client.setQueryData(pickFolderQueryKeys.list(), {
      items: FOLDERS,
    });
    client.setQueryData(likedShopQueryKeys.list(), {
      pages: [LIKED_SHOPS_PAGE],
      pageParams: [1],
    });

    if (cacheShopFolders) {
      client.setQueryData(pickFolderQueryKeys.shopFolders(SHOP.id), {
        folderIds: ["folder-1"],
      });
    }

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PicksScreen />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Pages/Picks",
  component: PicksScreenStory,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PicksScreenStory>;

export default meta;
type Story = StoryObj<typeof meta>;

let resolveShopFoldersRequest:
  | ((response: Response) => void)
  | undefined;

/** 상점의 폴더 소속 요청만 지연해 로딩 상태를 유지합니다. */
function installDelayedShopFoldersRequest() {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input) => {
    const requestUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (requestUrl.includes(`/me/liked-shops/${SHOP.id}/folders`)) {
      return new Promise<Response>((resolve) => {
        resolveShopFoldersRequest = resolve;
      });
    }

    throw new Error(`예상하지 않은 API 요청입니다: ${requestUrl}`);
  };

  return () => {
    resolveShopFoldersRequest = undefined;
    globalThis.fetch = originalFetch;
  };
}

export const ChangeFolderFromShopCard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);
    const moveFolderButton = await canvas.findByRole("button", {
      name: "도레미 상점 폴더 이동",
    });

    await expect(
      canvas.getByRole("link", { name: "도레미 상점 상세 보기" }),
    ).toBeVisible();

    await userEvent.click(moveFolderButton);

    await expect(
      await documentBody.findByRole("dialog", {
        name: "내 픽 폴더 선택",
      }),
    ).toBeVisible();
    await expect(
      documentBody.getByRole("checkbox", { name: /성수 산책/ }),
    ).toBeChecked();
    await expect(
      documentBody.getByRole("checkbox", { name: /주말에 갈 곳/ }),
    ).not.toBeChecked();
    await expect(documentBody.getAllByRole("separator")).toHaveLength(
      FOLDERS.length - 1,
    );
  },
};

export const StableHeightWhileLoadingFolders: Story = {
  args: {
    cacheShopFolders: false,
  },
  beforeEach: installDelayedShopFoldersRequest,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole("button", {
        name: "도레미 상점 폴더 이동",
      }),
    );

    const dialog = await documentBody.findByRole("dialog", {
      name: "내 픽 폴더 선택",
    });

    await expect(
      documentBody.getByText("폴더를 불러오는 중입니다."),
    ).toBeVisible();
    await waitFor(() => {
      expect(dialog).toHaveAttribute("data-state", "open");
    });

    const sheet = dialog.firstElementChild;

    if (!(sheet instanceof HTMLElement)) {
      throw new Error("바텀시트 패널을 찾을 수 없습니다.");
    }

    const loadingHeight = sheet.getBoundingClientRect().height;

    resolveShopFoldersRequest?.(
      Response.json({
        success: true,
        data: {
          folderIds: ["folder-1"],
        },
      }),
    );

    await expect(
      await documentBody.findByRole("checkbox", { name: /성수 산책/ }),
    ).toBeChecked();

    await waitFor(() => {
      expect(sheet.getBoundingClientRect().height).toBe(loadingHeight);
    });
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
