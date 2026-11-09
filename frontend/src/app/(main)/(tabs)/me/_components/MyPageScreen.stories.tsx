import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { MyVisitLogListData, UserProfile } from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ComponentProps } from "react";
import { expect, userEvent, within } from "storybook/test";

import { ME_QUERY_KEYS } from "@/api/me/me.query-keys";
import { visitLogKeys } from "@/api/visit-log/visit-log.query";

import { MyPageScreen } from "./MyPageScreen";

const DEFAULT_USER = {
  id: "storybook-user",
  nickname: "소품 수집가",
  profileImage: null,
} satisfies UserProfile;

const EMPTY_VISIT_LOG_PAGE = {
  items: [],
  pagination: {
    totalCount: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
  },
  summary: {
    totalCount: 0,
    uniqueShopCount: 0,
  },
} satisfies MyVisitLogListData;

type MyPageStoryProps = Readonly<{
  args: ComponentProps<typeof MyPageScreen>;
  user?: UserProfile | null;
}>;

/** 실제 인증 Query 흐름을 유지하면서 스토리별 사용자 상태를 제공합니다. */
function MyPageStory({ args, user = DEFAULT_USER }: MyPageStoryProps) {
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
    client.setQueryData(visitLogKeys.myLists(), {
      pages: [EMPTY_VISIT_LOG_PAGE],
      pageParams: [1],
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MyPageScreen {...args} />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Pages/MyPage",
  component: MyPageScreen,
  parameters: { layout: "fullscreen" },
  render: (args) => <MyPageStory args={args} />,
} satisfies Meta<typeof MyPageScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "마이페이지" }),
    ).toBeVisible();
    await expect(canvas.getByText("소품 수집가")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "방문 로그 기록하기" }),
    ).toHaveAttribute("href", "/visit-logs/new");
    await expect(
      canvas.getByRole("link", { name: "방문 로그 0개 보기" }),
    ).toHaveAttribute("href", "/me/visit-logs");
    await expect(
      canvas.getByRole("link", { name: "내 산책 코스 3개 보기" }),
    ).toHaveAttribute("href", "/me/courses");
    await expect(
      canvas.queryByRole("link", { name: /내 픽/ }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("link", { name: /좋아요한 매장/ }),
    ).not.toBeInTheDocument();
  },
};

export const ProfileEdit: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (input, init) => {
      const requestUrl = input instanceof Request ? input.url : String(input);
      const requestMethod =
        init?.method ?? (input instanceof Request ? input.method : "GET");

      if (requestUrl.endsWith("/me") && requestMethod === "PATCH") {
        return Response.json({
          success: true,
          data: {
            ...DEFAULT_USER,
            nickname: "행운 수집가",
          },
        });
      }

      return originalFetch(input, init);
    };

    return () => {
      globalThis.fetch = originalFetch;
    };
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "프로필 수정" }));

    const nickname = canvas.getByRole("textbox", { name: "닉네임" });

    await userEvent.clear(nickname);
    await userEvent.type(nickname, "행운 수집가");
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));

    await expect(canvas.getByText("행운 수집가")).toBeVisible();
    await expect(canvas.getByText("프로필이 저장되었습니다.")).toBeVisible();
  },
};

export const Logout: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => new Response(null, { status: 204 });

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "로그아웃" }));
    await expect(canvas.getByText("로그아웃하시겠어요?")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "로그아웃 확인" }),
    );
    await expect(
      canvas.getByText("로그인하고 취향 기록을 모아보세요."),
    ).toBeVisible();
  },
};

export const LoggedOut: Story = {
  render: (args) => <MyPageStory args={args} user={null} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("로그인하고 취향 기록을 모아보세요."),
    ).toBeVisible();
    await expect(canvas.getByRole("link", { name: "로그인" })).toHaveAttribute(
      "href",
      "/login",
    );
  },
};

export const Empty: Story = {
  args: { isEmpty: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", { name: "방문 로그 0개 보기" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "내 산책 코스 0개 보기" }),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  args: { state: "loading" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: "마이페이지를 불러오는 중",
      }),
    ).toBeVisible();
  },
};

export const Error: Story = {
  args: { state: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("마이페이지를 불러오지 못했습니다."),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "다시 시도" }),
    ).toBeVisible();
  },
};
