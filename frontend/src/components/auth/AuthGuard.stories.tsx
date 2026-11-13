import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import type { UserProfile } from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, waitFor, within } from "storybook/test";

import { ME_QUERY_KEYS } from "@/api/me/me.query-keys";

import { AuthGuard } from "./AuthGuard";

const CURRENT_USER = {
  id: "user-1",
  nickname: "소품산책가",
  profileImage: null,
} satisfies UserProfile;

type AuthGuardStoryProps = Readonly<{
  user: UserProfile | null;
}>;

/** 로그인 상태별로 독립된 Query Cache를 제공해 인증 경계를 검증합니다. */
function AuthGuardStory({ user }: AuthGuardStoryProps) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
        },
      },
    });

    client.setQueryData(ME_QUERY_KEYS.profile(), user);

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard returnTo="/picks">
        <p>내 픽 비공개 화면</p>
      </AuthGuard>
    </QueryClientProvider>
  );
}

const meta = {
  title: "Auth/AuthGuard",
  component: AuthGuardStory,
  args: {
    user: CURRENT_USER,
  },
} satisfies Meta<typeof AuthGuardStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Authenticated: Story = {
  beforeEach: () => {
    getRouter().replace.mockClear();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("내 픽 비공개 화면")).toBeVisible();
    await expect(getRouter().replace).not.toHaveBeenCalled();
  },
};

export const Unauthenticated: Story = {
  args: {
    user: null,
  },
  beforeEach: () => {
    getRouter().replace.mockClear();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByText("내 픽 비공개 화면"),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(getRouter().replace).toHaveBeenCalledWith(
        "/login?returnTo=%2Fpicks&reason=auth-required",
      );
    });
  },
};
