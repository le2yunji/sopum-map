import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type {
  PickFolderListData,
  PickFolderShopListData,
  ShopListData,
  ShopListItem,
} from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ComponentProps } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import {
  likedShopQueryKeys,
  pickFolderQueryKeys,
} from "@/api/pick-folder/pick-folder.query";

import { PicksScreen } from "./PicksScreen";

const PAGINATION = {
  page: 1,
  limit: 10,
  totalCount: 1,
  totalPages: 1,
  hasNext: false,
};

const FOLDERS = {
  items: [
    {
      id: "folder-wishlist",
      title: "가고 싶은 곳",
      description: null,
      order: 0,
      shopCount: 1,
      courseId: null,
    },
    {
      id: "folder-gacha",
      title: "가챠가챠",
      description: null,
      order: 1,
      shopCount: 1,
      courseId: null,
    },
  ],
} satisfies PickFolderListData;

/** 스토리에서 공통으로 사용할 상점 응답을 만듭니다. */
function createShop(id: string, name: string): ShopListItem {
  return {
    id,
    name,
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
  };
}

const SUNNY_SHOP = createShop("shop-sunny", "Sunny 소품샵");
const HAPPY_SHOP = createShop("shop-happy", "해피해피샵");
const GACHA_SHOP = createShop("shop-gacha", "가챠가챠");

type PicksStoryProps = Readonly<{
  args: ComponentProps<typeof PicksScreen>;
  folders?: PickFolderListData;
  likedShops?: ShopListItem[];
  seedQueries?: boolean;
}>;

/** 실제 Query 흐름을 유지하면서 스토리별 픽 데이터를 제공합니다. */
function PicksStory({
  args,
  folders = FOLDERS,
  likedShops = [SUNNY_SHOP, HAPPY_SHOP, GACHA_SHOP],
  seedQueries = true,
}: PicksStoryProps) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });

    if (!seedQueries) {
      return client;
    }

    const likedShopData: ShopListData = {
      items: likedShops,
      pagination: {
        ...PAGINATION,
        totalCount: likedShops.length,
      },
    };

    const wishlistData: PickFolderShopListData = {
      items: [HAPPY_SHOP],
      pagination: PAGINATION,
    };

    const gachaData: PickFolderShopListData = {
      items: [GACHA_SHOP],
      pagination: PAGINATION,
    };

    client.setQueryData(pickFolderQueryKeys.list(), folders);
    client.setQueryData(likedShopQueryKeys.list(), {
      pages: [likedShopData],
      pageParams: [1],
    });
    client.setQueryData(pickFolderQueryKeys.shops("folder-wishlist"), {
      pages: [wishlistData],
      pageParams: [1],
    });
    client.setQueryData(pickFolderQueryKeys.shops("folder-gacha"), {
      pages: [gachaData],
      pageParams: [1],
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PicksScreen {...args} />
    </QueryClientProvider>
  );
}

/** API 클라이언트가 기대하는 성공 응답 형식을 만듭니다. */
function successResponse(data: unknown): Response {
  return Response.json({ success: true, data });
}

const meta = {
  title: "Pages/Picks",
  component: PicksScreen,
  parameters: { layout: "fullscreen" },
  args: { onCreateCourse: fn() },
  render: (args) => <PicksStory args={args} />,
} satisfies Meta<typeof PicksScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("heading", { name: "내 픽" })).toBeVisible();
    await expect(canvas.getByText("Sunny 소품샵")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "가고 싶은 곳 1" }),
    );
    await expect(canvas.getByText("해피해피샵")).toBeVisible();
    await expect(canvas.queryByText("Sunny 소품샵")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "폴더 작업 열기" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "폴더 속 샵으로 코스 만들기" }),
    );
    await expect(args.onCreateCourse).toHaveBeenCalledWith("folder-wishlist");
  },
};

export const AddFolder: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (input, init) => {
      const url = new URL(
        typeof input === "string" ? input : input instanceof URL ? input : input.url,
        window.location.origin,
      );
      const method = init?.method ?? "GET";

      if (url.pathname.endsWith("/me/pick-folders") && method === "POST") {
        return successResponse({
          id: "folder-weekend",
          title: "주말 나들이",
          description: null,
          order: 2,
        });
      }

      if (url.pathname.endsWith("/me/pick-folders")) {
        return successResponse({
          items: [
            ...FOLDERS.items,
            {
              id: "folder-weekend",
              title: "주말 나들이",
              description: null,
              order: 2,
              shopCount: 0,
              courseId: null,
            },
          ],
        });
      }

      return successResponse({ items: [], pagination: PAGINATION });
    };

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "폴더 작업 열기" }));
    await expect(
      canvas.getByRole("button", { name: "폴더 속 샵으로 코스 만들기" }),
    ).toHaveFocus();
    await userEvent.click(
      canvas.getByRole("button", { name: "새로운 폴더 추가하기" }),
    );
    await userEvent.type(
      canvas.getByRole("textbox", { name: "새 폴더 이름" }),
      "주말 나들이",
    );
    await userEvent.click(canvas.getByRole("button", { name: "폴더 만들기" }));
    await expect(
      await canvas.findByRole("button", { name: "주말 나들이 0" }),
    ).toBeVisible();
  },
};

export const DuplicateFolder: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "폴더 작업 열기" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "새로운 폴더 추가하기" }),
    );
    await userEvent.type(
      canvas.getByRole("textbox", { name: "새 폴더 이름" }),
      "가고 싶은 곳",
    );
    await expect(canvas.getByText("이미 사용 중인 폴더 이름이에요.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "폴더 만들기" })).toBeDisabled();
  },
};

export const Empty: Story = {
  render: (args) => <PicksStory args={args} likedShops={[]} />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("아직 픽한 상점이 없어요"),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = () => new Promise<Response>(() => undefined);

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  render: (args) => <PicksStory args={args} seedQueries={false} />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: "내 픽을 불러오는 중",
      }),
    ).toBeVisible();
  },
};

export const Error: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      Response.json(
        {
          success: false,
          error: {
            code: "PICK_FOLDER_FETCH_FAILED",
            message: "내 픽 폴더를 불러오지 못했습니다.",
          },
        },
        { status: 500 },
      );

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  render: (args) => <PicksStory args={args} seedQueries={false} />,
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole("button", { name: "다시 시도" }),
    ).toBeVisible();
  },
};
