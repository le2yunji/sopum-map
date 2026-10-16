import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { visitLogKeys } from "@/api/visit-log/visit-log.query";
import { VisitLogEditScreen } from "./VisitLogEditScreen";

/** 수정할 로그를 스토리 전용 Query 캐시에 준비합니다. */
function EditStory() {
  const [client] = useState(() => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } } });
    queryClient.setQueryData(visitLogKeys.myDetail("log-1"), {
      id: "log-1",
      shop: { id: "shop-1", name: "모모 소품샵", imageUrl: null, address: "서울 성동구" },
      selectedTagKeys: ["keyrings", "cute"],
      content: "기존 방문 내용",
      imageUrls: [],
      visitedAt: "2026-10-14T03:00:00.000Z",
      createdAt: "2026-10-14T04:00:00.000Z",
      updatedAt: "2026-10-14T04:00:00.000Z",
    });
    return queryClient;
  });
  return <QueryClientProvider client={client}><VisitLogEditScreen visitLogId="log-1" /></QueryClientProvider>;
}

const meta = { title: "Pages/VisitLogEdit", component: EditStory, parameters: { layout: "fullscreen" } } satisfies Meta<typeof EditStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ExistingValues: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue("기존 방문 내용")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "키링" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "키링" }));
    await userEvent.click(canvas.getByRole("button", { name: "아기자기" }));
    await userEvent.click(canvas.getByRole("button", { name: "수정 완료" }));
    await expect(canvas.getByText("태그를 1개 이상 선택해 주세요.")).toBeVisible();
  },
};

export const SmallMobile: Story = { globals: { viewport: { value: "sopumSmall", isRotated: false } } };
export const LargeMobile: Story = { globals: { viewport: { value: "sopumLarge", isRotated: false } } };
