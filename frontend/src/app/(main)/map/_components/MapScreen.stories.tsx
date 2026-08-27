import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { MAP_SHOPS } from "../_data/map.fixture";
import { MapScreen } from "./MapScreen";

const TestMap = () => <div aria-label="네이버 지도" className="absolute inset-0 bg-green-50" />;

/** 실제 지도 마커 대신 상점 선택 이벤트를 검증할 버튼을 제공합니다. */
const InteractiveTestMap = ({
  onSelectShop,
}: Readonly<{ onSelectShop: (shopId: string) => void }>) => (
  <div aria-label="네이버 지도" className="absolute inset-0 bg-green-50">
    <button type="button" onClick={() => onSelectShop("momone")}>
      모모네 지도 마커
    </button>
  </div>
);

const meta = {
  title: "Pages/MapScreen",
  component: MapScreen,
  parameters: { layout: "fullscreen" },
  args: {
    shops: MAP_SHOPS,
    mapSlot: () => <TestMap />,
  },
} satisfies Meta<typeof MapScreen>;

export default meta;
type Story = StoryObj<typeof MapScreen>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("네이버 지도")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "지도 나가기" }),
    ).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll("dialog")).toHaveLength(2);
    await expect(canvas.getByRole("searchbox", { name: "상점 이름 검색" })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: /가챠가챠/ })).toHaveAttribute("href", "/shops/gachagacha");
    await expect(
      canvas.getByRole("group", { name: "지도 상점 필터" }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "상세 필터 열기" }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "전체" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "태그" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "내 픽" }));
    await expect(
      canvas.queryByRole("link", { name: /클로버/ }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("link", { name: /가챠가챠/ }),
    ).toBeInTheDocument();
  },
};

export const SearchEmpty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("searchbox", { name: "상점 이름 검색" });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog", { name: "상점 검색" });
    const searchInput = within(dialog).getByRole("searchbox", {
      name: "검색할 상점 입력",
    });
    await waitFor(() => expect(searchInput).toHaveFocus());
    await userEvent.type(searchInput, "없는 상점");
    await expect(within(dialog).getByText("검색 결과가 없어요")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "검색어 지우기" }));
    await expect(canvas.getByRole("link", { name: /모모네 소품샵/ })).toBeInTheDocument();
  },
};

export const SearchAndSelect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("searchbox", { name: "상점 이름 검색" });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog", { name: "상점 검색" });
    const searchInput = within(dialog).getByRole("searchbox", {
      name: "검색할 상점 입력",
    });
    await userEvent.type(searchInput, "클로버");
    await expect(
      within(dialog).getByRole("button", { name: /클로버/ }),
    ).toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole("button", { name: /클로버/ }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole("dialog", { name: "상점 검색" }),
      ).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveValue("클로버");
    await expect(
      canvas.getByRole("region", { name: "선택한 상점" }),
    ).toHaveTextContent("클로버");
    await expect(
      canvas.queryByRole("region", { name: "검색된 소품샵" }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "목록보기" }));
    await expect(
      canvas.getByRole("button", { name: "상점 목록 펼치기" }),
    ).toHaveAttribute("aria-expanded", "false");
  },
};

export const CloseSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "상점 목록 펼치기" }),
    );
    const trigger = canvas.getByRole("searchbox", { name: "상점 이름 검색" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(
      canvas.getByRole("button", { name: "상점 검색 닫기" }),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(
      canvas.getByRole("button", { name: "상점 목록 펼치기" }),
    ).toHaveAttribute("aria-expanded", "false");
  },
};

export const SelectMapMarker: Story = {
  args: {
    mapSlot: ({ onSelectShop }) => (
      <InteractiveTestMap onSelectShop={onSelectShop} />
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "모모네 지도 마커" }),
    );
    await expect(
      canvas.getByRole("region", { name: "선택한 상점" }),
    ).toHaveTextContent("모모네 소품샵");
    await userEvent.click(canvas.getByRole("button", { name: "내 픽" }));
    await expect(
      canvas.queryByRole("region", { name: "선택한 상점" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("region", { name: "검색된 소품샵" }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "전체" }));
    await expect(
      canvas.queryByRole("region", { name: "선택한 상점" }),
    ).not.toBeInTheDocument();
  },
};

export const InfiniteScroll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole("link", { name: /무드 스토어/ }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "상점 목록 펼치기" }),
    );

    const loadMoreTarget = canvasElement.querySelector(
      'li[aria-hidden="true"]',
    );
    loadMoreTarget?.scrollIntoView();

    await waitFor(() =>
      expect(
        canvas.getByRole("link", { name: /무드 스토어/ }),
      ).toBeInTheDocument(),
    );
  },
};

export const TagFilterSheet: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "태그" }));
    const dialog = canvas.getByRole("dialog", { name: "태그 필터" });
    await userEvent.click(within(dialog).getByRole("button", { name: "# 가챠" }));
    await expect(within(dialog).getByRole("button", { name: "1개 태그 적용" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        canvas.queryByRole("dialog", { name: "태그 필터" }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "태그" }),
      ).toHaveFocus(),
    );
  },
};

export const EmptyData: Story = {
  args: { shops: [], mapSlot: () => <TestMap /> },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("조건에 맞는 상점이 없어요")).toBeInTheDocument();
  },
};
