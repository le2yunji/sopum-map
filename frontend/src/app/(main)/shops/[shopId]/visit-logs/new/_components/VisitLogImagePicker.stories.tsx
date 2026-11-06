import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { VisitLogImagePicker } from "./VisitLogImagePicker";

const initialImages = Array.from({ length: 3 }, (_, index) => ({
  key: `visit-log-image-${index + 1}`,
  url: `/images/visit-logs/visit-0${index + 1}.webp`,
}));

const meta = {
  title: "Pages/VisitLogImagePicker",
  component: VisitLogImagePicker,
  decorators: [
    (Story) => (
      <div className="px-5 py-4">
        <Story />
      </div>
    ),
  ],
  args: {
    initialImages,
    scrollerClassName: "-mx-5 px-5 scroll-px-5",
    onChange: fn(),
  },
} satisfies Meta<typeof VisitLogImagePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HorizontalImageList: Story = {
  globals: { viewport: { value: "sopumSmall", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", { name: /사진 추가/ });
    const firstImage = canvas.getByAltText("첨부 사진 1");
    const imageTile = firstImage.parentElement;
    const imageGroup = canvas.getByRole("group", { name: "방문 로그 사진" });
    const picker = imageGroup.parentElement;
    if (!picker) throw new Error("사진 선택기 컨테이너를 찾을 수 없습니다.");
    const initialButtonRect = addButton.getBoundingClientRect();
    const imageGroupRect = imageGroup.getBoundingClientRect();
    const pickerRect = picker.getBoundingClientRect();

    await expect(imageTile).not.toBeNull();
    await expect(imageGroupRect.left).toBe(pickerRect.left - 20);
    await expect(imageGroupRect.right).toBe(pickerRect.right + 20);
    await expect(initialButtonRect.left).toBe(pickerRect.left);
    await expect(initialButtonRect.width).toBe(
      imageTile?.getBoundingClientRect().width,
    );
    await expect(initialButtonRect.height).toBe(
      imageTile?.getBoundingClientRect().height,
    );
    await expect(imageGroup.scrollWidth).toBeGreaterThan(imageGroup.clientWidth);

    await userEvent.click(
      canvas.getAllByRole("button", { name: /첨부 사진 \d+ 삭제/ })[0],
    );
    await expect(addButton).toBeEnabled();
    await expect(addButton.getBoundingClientRect().width).toBe(
      initialButtonRect.width,
    );
    await expect(addButton.getBoundingClientRect().height).toBe(
      initialButtonRect.height,
    );
  },
};
