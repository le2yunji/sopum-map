import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type {
  LikedShopListData,
  LikedShopListItem,
  PickFolderListItem,
  PickFolderShopListData,
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

const FOLDER_SHOPS_PAGE = {
  items: [
    {
      id: SHOP.id,
      name: SHOP.name,
      category: SHOP.category,
      address: SHOP.address,
      isLiked: true,
      regionGroup: SHOP.regionGroup,
      mainImageUrl: SHOP.mainImageUrl,
    },
  ],
  pagination: {
    totalCount: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
  },
} satisfies PickFolderShopListData;

const EMPTY_FOLDER_SHOPS_PAGE = {
  items: [],
  pagination: {
    totalCount: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
  },
} satisfies PickFolderShopListData;

type PicksScreenStoryProps = Readonly<{
  initialShopFolderIds?: string[] | null;
}>;

/** 실제 화면 쿼리를 유지하면서 스토리별 초기 서버 상태를 제공합니다. */
function PicksScreenStory({
  initialShopFolderIds = ["folder-1"],
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

    client.setQueryData(pickFolderQueryKeys.shops("folder-1"), {
      pages: [FOLDER_SHOPS_PAGE],
      pageParams: [1],
    });
    client.setQueryData(pickFolderQueryKeys.courseRegions("folder-1"), {
      items: [],
    });

    if (initialShopFolderIds) {
      client.setQueryData(pickFolderQueryKeys.shopFolders(SHOP.id), {
        folderIds: initialShopFolderIds,
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
    initialShopFolderIds: null,
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

let updatedFolderIds: string[] | undefined;

/** 폴더 이동 뒤 관련 목록이 서버 상태로 다시 조회되는 흐름을 제공합니다. */
function installMoveShopRequest() {
  const originalFetch = globalThis.fetch;

  updatedFolderIds = undefined;
  globalThis.fetch = async (input, init) => {
    const requestUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const url = new URL(requestUrl);

    if (
      init?.method === "PUT" &&
      url.pathname.endsWith(`/me/liked-shops/${SHOP.id}/folders`)
    ) {
      const requestBody = JSON.parse(String(init.body)) as {
        folderIds: string[];
      };

      updatedFolderIds = requestBody.folderIds;

      return Response.json({
        success: true,
        data: {
          folderIds: updatedFolderIds,
        },
      });
    }

    if (url.pathname.endsWith("/me/pick-folders")) {
      return Response.json({
        success: true,
        data: {
          items: FOLDERS.map((folder) =>
            folder.id === "folder-1" ? { ...folder, shopCount: 0 } : folder,
          ),
        },
      });
    }

    if (url.pathname.endsWith("/pick-folders/folder-1/shops")) {
      return Response.json({
        success: true,
        data: EMPTY_FOLDER_SHOPS_PAGE,
      });
    }

    if (url.pathname.endsWith("/pick-folders/folder-2/shops")) {
      return Response.json({
        success: true,
        data: FOLDER_SHOPS_PAGE,
      });
    }

    if (url.pathname.endsWith("/course-regions")) {
      return Response.json({
        success: true,
        data: {
          items: [],
        },
      });
    }

    throw new Error(`예상하지 않은 API 요청입니다: ${requestUrl}`);
  };

  return () => {
    updatedFolderIds = undefined;
    globalThis.fetch = originalFetch;
  };
}

export const RemoveShopFromCurrentFolder: Story = {
  args: {
    initialShopFolderIds: ["folder-1", "folder-2"],
  },
  beforeEach: installMoveShopRequest,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole("button", { name: "성수 산책 1" }),
    );
    await expect(
      canvas.getByRole("link", { name: "도레미 상점 상세 보기" }),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "도레미 상점 폴더 이동" }),
    );

    const currentFolderCheckbox = await documentBody.findByRole("checkbox", {
      name: /성수 산책/,
    });
    const otherFolderCheckbox = documentBody.getByRole("checkbox", {
      name: /주말에 갈 곳/,
    });

    await expect(currentFolderCheckbox).toBeChecked();
    await expect(otherFolderCheckbox).toBeChecked();
    await userEvent.click(currentFolderCheckbox);
    await userEvent.click(documentBody.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(updatedFolderIds).toEqual(["folder-2"]);
    });
    await expect(
      await canvas.findByText("아직 이 폴더에 담긴 상점이 없어요"),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("link", { name: "도레미 상점 상세 보기" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      await canvas.findByRole("button", { name: "주말에 갈 곳 2" }),
    );
    await expect(
      await canvas.findByRole("link", { name: "도레미 상점 상세 보기" }),
    ).toBeVisible();
  },
};

export const KeyboardClosesAndRestoresFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);
    const moveFolderButton = await canvas.findByRole("button", {
      name: "도레미 상점 폴더 이동",
    });

    moveFolderButton.focus();
    await userEvent.keyboard("{Enter}");
    await expect(
      await documentBody.findByRole("dialog", {
        name: "내 픽 폴더 선택",
      }),
    ).toBeVisible();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => {
      expect(
        documentBody.queryByRole("dialog", {
          name: "내 픽 폴더 선택",
        }),
      ).not.toBeInTheDocument();
      expect(moveFolderButton).toHaveFocus();
    });
  },
};

/** 카드 액션과 열린 시트가 현재 모바일 뷰포트 안에 있는지 확인합니다. */
async function expectFolderSheetInsideViewport(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const documentBody = within(canvasElement.ownerDocument.body);
  const moveFolderButton = await canvas.findByRole("button", {
    name: "도레미 상점 폴더 이동",
  });
  const buttonRect = moveFolderButton.getBoundingClientRect();

  await expect(buttonRect.left).toBeGreaterThanOrEqual(0);
  await expect(buttonRect.right).toBeLessThanOrEqual(window.innerWidth);
  await userEvent.click(moveFolderButton);

  const dialog = await documentBody.findByRole("dialog", {
    name: "내 픽 폴더 선택",
  });
  const dialogRect = dialog.getBoundingClientRect();

  await expect(dialogRect.left).toBeGreaterThanOrEqual(0);
  await expect(dialogRect.right).toBeLessThanOrEqual(window.innerWidth);
}

export const SmallMobile: Story = {
  globals: {
    viewport: {
      value: "sopumSmall",
      isRotated: false,
    },
  },
  play: async ({ canvasElement }) => {
    await expectFolderSheetInsideViewport(canvasElement);
  },
};

export const LargeMobile: Story = {
  globals: {
    viewport: {
      value: "sopumLarge",
      isRotated: false,
    },
  },
  play: async ({ canvasElement }) => {
    await expectFolderSheetInsideViewport(canvasElement);
  },
};
