import type { MyVisitLogListItem } from "@sopum-map/shared";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { VisitLogDetailContent } from "./VisitLogDetailContent";
import { VisitLogDetailStateView } from "./VisitLogDetailStateView";
import { VisitLogDetailView } from "./VisitLogDetailView";

const visitLog = {
  id: "log-1",
  shop: {
    id: "shop-1",
    name: "모모 소품샵",
    imageUrl: "/images/shops/shop_example.png",
    address: "서울 성동구 연무장길",
  },
  selectedTagKeys: ["keyrings", "cute"],
  content: "키링이 다양하고 천천히 구경하기 좋았어요.",
  images: [
    {
      key: "visit-log/log-1/photo-1",
      url: "/images/shops/shop_example.png",
    },
    {
      key: "visit-log/log-1/photo-2",
      url: "/images/profiles/shop_default.webp",
    },
  ],
  visitedAt: "2026-10-14T03:00:00.000Z",
  createdAt: "2026-10-14T04:00:00.000Z",
  updatedAt: "2026-10-14T04:00:00.000Z",
} satisfies MyVisitLogListItem;

const visitLogWithoutPhoto = {
  ...visitLog,
  id: "log-2",
  shop: {
    ...visitLog.shop,
    id: "shop-2",
    name: "초록 문방구",
  },
  images: [],
} satisfies MyVisitLogListItem;

/** 상세 화면의 삭제 요청 결과를 Story 안에서 확인합니다. */
function DetailStory() {
  const [isDeleteRequested, setIsDeleteRequested] = useState(false);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-white">
      <VisitLogDetailContent
        visitLog={visitLog}
        onDelete={() => setIsDeleteRequested(true)}
      />

      {isDeleteRequested ? <p role="status">삭제 요청됨</p> : null}
    </div>
  );
}

/** 모달의 닫기 요청 결과를 Story 안에서 확인합니다. */
function ModalStory() {
  const [isClosed, setIsClosed] = useState(false);

  return (
    <div className="min-h-dvh bg-green-50">
      <p className="p-5">방문 로그 피드</p>

      {!isClosed ? (
        <VisitLogDetailView
          mode="modal"
          visitLog={visitLog}
          onClose={() => setIsClosed(true)}
          onConfirmDelete={() => undefined}
        />
      ) : null}

      {isClosed ? <p role="status">모달 닫기 요청됨</p> : null}
    </div>
  );
}

/** 오류 화면의 다시 시도 동작을 Story 안에서 확인합니다. */
function ErrorStory() {
  const [isRetried, setIsRetried] = useState(false);

  return (
    <>
      <VisitLogDetailStateView
        mode="page"
        status="error"
        onClose={() => undefined}
        onRetry={() => setIsRetried(true)}
      />
      {isRetried ? <p role="status">다시 시도 요청됨</p> : null}
    </>
  );
}

const meta = {
  title: "Pages/MyVisitLogs/Detail",
  component: DetailStory,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
} satisfies Meta<typeof DetailStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("img", { name: "모모 소품샵 방문 사진 1" })
        .parentElement,
    ).toHaveClass("aspect-square");

    await expect(
      canvas.getByRole("heading", { name: "모모 소품샵" }),
    ).toBeVisible();
    await expect(canvas.getByText("2026년 10월 14일")).toBeVisible();
    await expect(canvas.getByLabelText("현재 사진 1 / 2")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "방문 로그 수정" }),
    ).toHaveAttribute("href", "/visit-logs/log-1/edit");
    const editActionBounds = canvas
      .getByRole("link", { name: "방문 로그 수정" })
      .getBoundingClientRect();
    const deleteActionBounds = canvas
      .getByRole("button", { name: "방문 로그 삭제" })
      .getBoundingClientRect();

    await expect(editActionBounds.top).toBe(deleteActionBounds.top);
    await expect(editActionBounds.height).toBe(deleteActionBounds.height);

    await userEvent.click(
      canvas.getByRole("button", { name: "방문 로그 삭제" }),
    );
    await expect(canvas.getByText("삭제 요청됨")).toBeVisible();
  },
};

export const ModalPreview: Story = {
  render: () => <ModalStory />,
};

export const Modal: Story = {
  render: () => <ModalStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("dialog", { name: "방문 로그 상세" }),
    ).toHaveAttribute("open");
    await expect(
      canvas.getByRole("dialog", { name: "방문 로그 상세" }),
    ).toHaveClass("rounded-card-lg");
    await expect(
      canvas.getByRole("dialog", { name: "방문 로그 상세" }),
    ).toHaveClass("aspect-[3/4]", "max-w-[420px]");
    await expect(
      canvas.getByRole("img", { name: "모모 소품샵 방문 사진 1" })
        .parentElement,
    ).toHaveClass("aspect-[4/3]");
    await expect(
      canvas.getByRole("heading", { name: "방문 로그", level: 1 }),
    ).toHaveFocus();
    const editActionBounds = canvas
      .getByRole("link", { name: "방문 로그 수정" })
      .getBoundingClientRect();
    const deleteActionBounds = canvas
      .getByRole("button", { name: "방문 로그 삭제" })
      .getBoundingClientRect();

    await expect(editActionBounds.top).toBe(deleteActionBounds.top);
    await expect(editActionBounds.height).toBe(deleteActionBounds.height);
    await expect(document.body.style.overscrollBehavior).toBe("none");
    await expect(document.documentElement.style.overscrollBehavior).toBe(
      "none",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "방문 로그 삭제" }),
    );
    await expect(
      canvas.getByRole("heading", { name: "방문 로그를 삭제할까요?" }),
    ).toBeVisible();
    const deleteDialog = canvas.getByRole("dialog", {
      name: "방문 로그를 삭제할까요?",
    });
    const deleteDialogBounds = deleteDialog.getBoundingClientRect();
    const cancelButton = canvas.getByRole("button", { name: "취소" });
    const confirmButton = canvas.getByRole("button", { name: "삭제" });

    await expect(
      cancelButton.getBoundingClientRect().left,
    ).toBeGreaterThanOrEqual(deleteDialogBounds.left);
    await expect(
      confirmButton.getBoundingClientRect().right,
    ).toBeLessThanOrEqual(deleteDialogBounds.right);
    await userEvent.click(canvas.getByRole("button", { name: "취소" }));
    await waitFor(() => expect(deleteDialog).not.toHaveAttribute("open"));
    await userEvent.click(
      canvas.getByRole("button", { name: "방문 로그 상세 닫기" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "모달 닫기 요청됨",
    );
    await waitFor(() =>
      expect(document.body.style.overscrollBehavior).toBe(""),
    );
    await expect(document.documentElement.style.overscrollBehavior).toBe("");
  },
};

export const WithoutVisitPhoto: Story = {
  render: () => (
    <VisitLogDetailContent
      visitLog={visitLogWithoutPhoto}
      onDelete={() => undefined}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("img", { name: "방문 사진 없음" }),
    ).toBeVisible();
    await expect(canvas.queryByText("상점 대표 이미지")).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  render: () => (
    <VisitLogDetailStateView
      mode="modal"
      status="loading"
      onClose={() => undefined}
      onRetry={() => undefined}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: "방문 로그 상세를 불러오는 중",
      }),
    ).toBeInTheDocument();
  },
};

export const SmallMobileModal: Story = {
  render: () => (
    <VisitLogDetailStateView
      mode="modal"
      status="loading"
      onClose={() => undefined}
      onRetry={() => undefined}
    />
  ),
  globals: { viewport: { value: "sopumSmall", isRotated: false } },
  play: async ({ canvasElement }) => {
    const dialog = within(canvasElement).getByRole("dialog", {
      name: "방문 로그 상세",
    });

    await expect(Math.round(dialog.getBoundingClientRect().width)).toBe(
      window.innerWidth - 32,
    );
  },
};

export const Error: Story = {
  render: () => <ErrorStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "다시 시도" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "다시 시도 요청됨",
    );
  },
};
