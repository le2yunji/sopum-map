import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";

import { PickFolderSheet } from "./PickFolderSheet";

const fetchPickFolders = fn<typeof globalThis.fetch>();

const meta = {
  title: "Pick/PickFolderSheet",
  component: PickFolderSheet,
  args: {
    open: false,
    shopId: "shop-1",
    onOpenChange: fn(),
  },
} satisfies Meta<typeof PickFolderSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  beforeEach: () => {
    const originalFetch = globalThis.fetch;

    fetchPickFolders.mockReset();
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
