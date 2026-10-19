import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { MyVisitLogListData } from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { visitLogKeys } from "@/api/visit-log/visit-log.query";
import { MyVisitLogsScreen } from "./MyVisitLogsScreen";

const listData: MyVisitLogListData = {
  items: [
    {
      id: "log-1",
      shop: { id: "shop-1", name: "모모 소품샵", imageUrl: null, address: "서울 성동구 연무장길" },
      selectedTagKeys: ["keyrings", "cute"],
      content: "키링이 다양하고 천천히 구경하기 좋았어요.",
      imageUrls: [],
      visitedAt: "2026-10-14T03:00:00.000Z",
      createdAt: "2026-10-14T04:00:00.000Z",
      updatedAt: "2026-10-14T04:00:00.000Z",
    },
  ],
  pagination: { totalCount: 1, page: 1, limit: 10, totalPages: 1, hasNext: false },
  summary: { totalCount: 1, uniqueShopCount: 1 },
};

/** 방문 로그 목록 데이터를 격리된 Query 캐시에 넣습니다. */
function VisitLogsStory({ empty = false }: Readonly<{ empty?: boolean }>) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
    const page = empty ? { ...listData, items: [], pagination: { ...listData.pagination, totalCount: 0 }, summary: { totalCount: 0, uniqueShopCount: 0 } } : listData;
    client.setQueryData(visitLogKeys.myLists(), { pages: [page], pageParams: [1] });
    return client;
  });
  return <QueryClientProvider client={queryClient}><MyVisitLogsScreen /></QueryClientProvider>;
}

const meta = { title: "Pages/MyVisitLogs", component: VisitLogsStory, parameters: { layout: "fullscreen" }, args: { empty: false } } satisfies Meta<typeof VisitLogsStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "내 방문 로그" })).toBeVisible();
    await expect(canvas.getByText("모모 소품샵")).toBeVisible();
    await expect(canvas.getByText("키링")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "삭제" }));
    await expect(canvas.getByRole("heading", { name: "방문 로그를 삭제할까요?" })).toBeVisible();
  },
};

export const Empty: Story = { args: { empty: true }, play: async ({ canvasElement }) => { await expect(within(canvasElement).getByText("아직 방문 로그가 없어요")).toBeVisible(); } };
export const SmallMobile: Story = { globals: { viewport: { value: "sopumSmall", isRotated: false } } };
export const LargeMobile: Story = { globals: { viewport: { value: "sopumLarge", isRotated: false } } };
