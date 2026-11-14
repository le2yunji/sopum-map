import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { PickFolderSheet } from "./PickFolderSheet";

const fetchPickFolders = fn<typeof globalThis.fetch>();
const handleOpenChange = fn<(open: boolean) => void>();

const meta = {
  title: "Pick/PickFolderSheet",
  component: PickFolderSheet,
  args: {
    open: false,
    shopId: "shop-1",
    onOpenChange: handleOpenChange,
  },
} satisfies Meta<typeof PickFolderSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;

    fetchPickFolders.mockReset();
    handleOpenChange.mockClear();
    fetchPickFolders.mockResolvedValue(
      Response.json({
        success: true,
        data: {
          items: [],
        },
      }),
    );
    globalThis.fetch = fetchPickFolders;

    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async () => {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });

    await expect(fetchPickFolders).not.toHaveBeenCalled();
  },
};

let updateRequestCount = 0;
let resolveFirstUpdateRequest:
  | ((response: Response) => void)
  | undefined;

/** 첫 저장만 지연·실패시켜 중복 제출과 재시도를 검증합니다. */
function installRetryFolderUpdateRequest() {
  const originalFetch = globalThis.fetch;

  updateRequestCount = 0;
  resolveFirstUpdateRequest = undefined;
  handleOpenChange.mockClear();

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
      url.pathname.endsWith("/me/liked-shops/shop-1/folders")
    ) {
      updateRequestCount += 1;

      if (updateRequestCount === 1) {
        return new Promise<Response>((resolve) => {
          resolveFirstUpdateRequest = resolve;
        });
      }

      return Response.json({
        success: true,
        data: {
          folderIds: ["folder-1"],
        },
      });
    }

    if (url.pathname.endsWith("/me/liked-shops/shop-1/folders")) {
      return Response.json({
        success: true,
        data: {
          folderIds: ["folder-1"],
        },
      });
    }

    if (url.pathname.endsWith("/me/pick-folders")) {
      return Response.json({
        success: true,
        data: {
          items: [
            {
              id: "folder-1",
              title: "성수 산책",
              description: null,
              order: 0,
              shopCount: 1,
              courses: [],
            },
          ],
        },
      });
    }

    throw new Error(`예상하지 않은 API 요청입니다: ${requestUrl}`);
  };

  return () => {
    updateRequestCount = 0;
    resolveFirstUpdateRequest = undefined;
    globalThis.fetch = originalFetch;
  };
}

export const RetryAfterSaveFailure: Story = {
  args: {
    open: true,
  },
  beforeEach: installRetryFolderUpdateRequest,
  play: async ({ canvasElement }) => {
    const documentBody = within(canvasElement.ownerDocument.body);
    const dialog = await documentBody.findByRole("dialog", {
      name: "내 픽 폴더 선택",
    });
    const saveButton = await documentBody.findByRole("button", {
      name: "저장",
    });

    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(updateRequestCount).toBe(1);
    });

    const pendingButton = documentBody.getByRole("button", {
      name: "처리 중",
    });

    await expect(pendingButton).toBeDisabled();
    await userEvent.click(pendingButton);
    await expect(updateRequestCount).toBe(1);

    resolveFirstUpdateRequest?.(
      Response.json(
        {
          success: false,
          error: {
            code: "UPDATE_FAILED",
            message: "폴더를 저장하지 못했습니다.",
          },
        },
        { status: 500 },
      ),
    );

    await expect(
      await documentBody.findByRole("alert"),
    ).toHaveTextContent("폴더를 저장하지 못했습니다.");
    await expect(dialog).toBeVisible();

    await userEvent.click(
      documentBody.getByRole("button", {
        name: "저장",
      }),
    );

    await waitFor(() => {
      expect(updateRequestCount).toBe(2);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  },
};
