import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type {
  ShopListData,
  ShopMapData,
  ShopMapMarker,
} from "@sopum-map/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import type { MapBounds } from "@/components/naver-map";

import { MapScreen } from "./MapScreen";

const INITIAL_BOUNDS = {
  southWestLat: 37.53,
  southWestLng: 127.03,
  northEastLat: 37.56,
  northEastLng: 127.08,
} satisfies MapBounds;

const MOVED_BOUNDS = {
  southWestLat: 37.56,
  southWestLng: 127.08,
  northEastLat: 37.59,
  northEastLng: 127.13,
} satisfies MapBounds;

type ShopListItem = ShopListData["items"][number];

const INITIAL_LIST_ITEM = {
  id: "initial-list-shop",
  category: "소품샵",
  tags: [
    {
      key: "cute",
      count: 3,
      label: "아기자기",
      group: "mood",
    },
  ],
  name: "기존 영역 목록 상점",
  address: "서울특별시 성동구 연무장길 1",
  mainImageUrl: "/images/shops/shop_example.png",
  region1: "서울특별시",
  region2: "성동구",
  region3: "성수동",
  regionGroup: "seongsu-seoulforest",
  latitude: 37.545,
  longitude: 127.055,
  status: "active",
  likeCount: 3,
  visitLogCount: 1,
  isLiked: false,
} satisfies ShopListItem;

const NEXT_LIST_ITEM = {
  ...INITIAL_LIST_ITEM,
  id: "next-list-shop",
  name: "다음 페이지 목록 상점",
  latitude: 37.546,
  longitude: 127.056,
} satisfies ShopListItem;

const MOVED_LIST_ITEM = {
  ...INITIAL_LIST_ITEM,
  id: "moved-list-shop",
  name: "새 영역 목록 상점",
  address: "서울특별시 광진구 아차산로 1",
  region2: "광진구",
  latitude: 37.575,
  longitude: 127.105,
} satisfies ShopListItem;

const FILTER_KEYWORD = "필터";

const FILTERED_LIST_ITEM = {
  ...INITIAL_LIST_ITEM,
  id: "filtered-list-shop",
  name: "필터된 목록 상점",
} satisfies ShopListItem;

const GLOBAL_SEARCH_ITEM = {
  ...INITIAL_LIST_ITEM,
  id: "global-search-shop",
  name: "지도 밖 검색 상점",
  address: "서울특별시 마포구 동교로 1",
  region2: "마포구",
  region3: "연남동",
  regionGroup: "hongdae-yeonnam",
  latitude: 37.565,
  longitude: 126.925,
} satisfies ShopListItem;

const INITIAL_MARKERS = [
  {
    id: "initial-marker-1",
    name: "기존 영역 마커 하나",
    latitude: 37.544,
    longitude: 127.054,
    isLiked: false,
  },
  {
    id: "initial-marker-2",
    name: "기존 영역 마커 둘",
    latitude: 37.548,
    longitude: 127.058,
    isLiked: true,
  },
] satisfies ShopMapMarker[];

const MOVED_MARKERS = [
  {
    id: "moved-marker-1",
    name: "새 영역 마커",
    latitude: 37.574,
    longitude: 127.104,
    isLiked: false,
  },
] satisfies ShopMapMarker[];

const FILTERED_MARKERS = [
  {
    id: "filtered-marker-1",
    name: "필터된 지도 마커",
    latitude: 37.547,
    longitude: 127.057,
    isLiked: false,
  },
] satisfies ShopMapMarker[];

type MapScreenProps = ComponentProps<typeof MapScreen>;
type CurrentMapSlotProps = Parameters<
  NonNullable<MapScreenProps["mapSlot"]>
>[0];

/** 다음 구현에서 MapScreen이 지도 경계 콜백을 슬롯에 전달하는 계약입니다. */
type ViewportMapSlotProps = CurrentMapSlotProps &
  Readonly<{
    onBoundsChange?: (bounds: MapBounds) => void;
  }>;

/** 실제 지도 SDK 없이 경계 변경과 표시된 마커를 관찰합니다. */
function ViewportMapSlot({ shops, onBoundsChange }: ViewportMapSlotProps) {
  const didInitialize = useRef(false);

  useEffect(() => {
    if (didInitialize.current || !onBoundsChange) {
      return;
    }

    didInitialize.current = true;
    onBoundsChange(INITIAL_BOUNDS);
  }, [onBoundsChange]);

  return (
    <section aria-label="테스트 지도" className="absolute inset-0 bg-green-50">
      <output aria-label="표시된 마커 수">{shops.length}</output>

      <ul aria-label="표시된 지도 마커">
        {shops.map((shop) => (
          <li key={shop.id}>{shop.name}</li>
        ))}
      </ul>

      <button type="button" onClick={() => onBoundsChange?.(MOVED_BOUNDS)}>
        테스트 지도 이동
      </button>
    </section>
  );
}

/** MapScreen의 지도 슬롯을 테스트용 지도 컴포넌트로 교체합니다. */
function renderViewportMap(props: ViewportMapSlotProps) {
  return <ViewportMapSlot {...props} />;
}

/** 각 스토리가 독립된 React Query 캐시를 사용하게 합니다. */
function MapScreenStory() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Number.POSITIVE_INFINITY,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MapScreen mapSlot={renderViewportMap} />
    </QueryClientProvider>
  );
}

type MapApiMockOptions = Readonly<{
  failMovedMap?: boolean;
  holdFilteredRequests?: boolean;
  holdMovedRequests?: boolean;
  initialMapTruncated?: boolean;
  listHasNextPage?: boolean;
}>;

let requestedUrls: string[] = [];
let releaseFilteredRequests: (() => void) | undefined;
let releaseMovedRequests: (() => void) | undefined;

/** 요청 입력을 검색 조건을 확인할 수 있는 URL로 바꿉니다. */
function toUrl(input: RequestInfo | URL): URL {
  if (input instanceof Request) {
    return new URL(input.url);
  }

  return new URL(input.toString(), globalThis.location.origin);
}

/** 요청 URL이 주어진 지도 영역을 포함하는지 확인합니다. */
function hasBounds(url: URL, bounds: MapBounds): boolean {
  return (
    url.searchParams.get("southWestLat") === String(bounds.southWestLat) &&
    url.searchParams.get("southWestLng") === String(bounds.southWestLng) &&
    url.searchParams.get("northEastLat") === String(bounds.northEastLat) &&
    url.searchParams.get("northEastLng") === String(bounds.northEastLng)
  );
}

/** 기록된 요청 중 경계와 API 경로가 일치하는 요청이 있는지 확인합니다. */
function hasRequested(pathname: string, bounds: MapBounds): boolean {
  return requestedUrls.some((requestUrl) => {
    const url = new URL(requestUrl);

    return url.pathname.endsWith(pathname) && hasBounds(url, bounds);
  });
}

/** 목록 API의 페이지네이션 응답을 만듭니다. */
function createListData(
  items: ShopListItem[],
  page: number,
  hasNext: boolean,
): ShopListData {
  return {
    items,
    pagination: {
      totalCount: hasNext || page > 1 ? 2 : items.length,
      page,
      limit: 10,
      totalPages: hasNext || page > 1 ? 2 : 1,
      hasNext,
    },
  };
}

/** 스토리별 지도·목록 API 상태를 fetch 경계에서 재현합니다. */
function installMapApiMock(options: MapApiMockOptions = {}) {
  return () => {
    const originalFetch = globalThis.fetch;
    requestedUrls = [];

    let releaseRequestGate: (() => void) | undefined;
    const movedRequestGate = options.holdMovedRequests
      ? new Promise<void>((resolve) => {
          releaseRequestGate = resolve;
        })
      : Promise.resolve();

    let releaseFilteredRequestGate: (() => void) | undefined;
    const filteredRequestGate = options.holdFilteredRequests
      ? new Promise<void>((resolve) => {
          releaseFilteredRequestGate = resolve;
        })
      : Promise.resolve();

    releaseMovedRequests = releaseRequestGate;
    releaseFilteredRequests = releaseFilteredRequestGate;

    globalThis.fetch = async (input) => {
      const url = toUrl(input);
      const isFilteredRequest =
        url.searchParams.get("keyword") === FILTER_KEYWORD;
      const isMovedRequest = hasBounds(url, MOVED_BOUNDS);

      requestedUrls.push(url.toString());

      if (isMovedRequest) {
        await movedRequestGate;
      }

      if (isFilteredRequest) {
        await filteredRequestGate;
      }

      if (url.pathname.endsWith("/shops/map")) {
        if (isMovedRequest && options.failMovedMap) {
          return Response.json(
            {
              success: false,
              error: {
                code: "SHOP_MAP_LOAD_FAILED",
                message: "지도 마커를 불러오지 못했습니다.",
              },
            },
            { status: 500 },
          );
        }

        const data: ShopMapData = {
          items: isFilteredRequest
            ? FILTERED_MARKERS
            : isMovedRequest
              ? MOVED_MARKERS
              : INITIAL_MARKERS,
          isTruncated: Boolean(options.initialMapTruncated) && !isMovedRequest,
        };

        return Response.json({ success: true, data });
      }

      if (url.pathname.endsWith("/shops")) {
        if (isFilteredRequest) {
          const isGlobalSearchRequest = !url.searchParams.has("southWestLat");

          return Response.json({
            success: true,
            data: createListData(
              isGlobalSearchRequest
                ? [GLOBAL_SEARCH_ITEM]
                : [FILTERED_LIST_ITEM],
              1,
              false,
            ),
          });
        }

        if (isMovedRequest) {
          return Response.json({
            success: true,
            data: createListData([MOVED_LIST_ITEM], 1, false),
          });
        }

        const page = Number(url.searchParams.get("page") ?? "1");
        const data =
          page === 2
            ? createListData([NEXT_LIST_ITEM], 2, false)
            : createListData(
                [INITIAL_LIST_ITEM],
                1,
                Boolean(options.listHasNextPage),
              );

        return Response.json({ success: true, data });
      }

      return Response.json(
        {
          success: false,
          error: {
            code: "UNEXPECTED_STORY_REQUEST",
            message: `예상하지 못한 요청입니다: ${url.pathname}`,
          },
        },
        { status: 404 },
      );
    };

    return () => {
      releaseRequestGate?.();
      releaseFilteredRequestGate?.();
      releaseFilteredRequests = undefined;
      releaseMovedRequests = undefined;
      globalThis.fetch = originalFetch;
    };
  };
}

/** 목록의 마지막 항목이 보이면 다음 페이지를 즉시 요청하게 합니다. */
function installImmediateIntersectionObserver() {
  const OriginalIntersectionObserver = globalThis.IntersectionObserver;

  class ImmediateIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly scrollMargin = "0px";
    readonly thresholds = [0];

    constructor(private readonly callback: IntersectionObserverCallback) {}

    disconnect() {}

    observe(target: Element) {
      const targetRect = target.getBoundingClientRect();

      this.callback(
        [
          {
            boundingClientRect: targetRect,
            intersectionRatio: 1,
            intersectionRect: targetRect,
            isIntersecting: true,
            rootBounds: null,
            target,
            time: performance.now(),
          },
        ],
        this,
      );
    }

    takeRecords() {
      return [];
    }

    unobserve() {}
  }

  globalThis.IntersectionObserver = ImmediateIntersectionObserver;

  return () => {
    globalThis.IntersectionObserver = OriginalIntersectionObserver;
  };
}

const meta = {
  title: "Pages/Map/MapScreen",
  component: MapScreenStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MapScreenStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InitialViewportSearch: Story = {
  beforeEach: installMapApiMock(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const map = within(canvas.getByRole("region", { name: "테스트 지도" }));

    await waitFor(() => {
      expect(hasRequested("/shops/map", INITIAL_BOUNDS)).toBe(true);
      expect(hasRequested("/shops", INITIAL_BOUNDS)).toBe(true);
    });

    await waitFor(() => {
      expect(map.getByLabelText("표시된 마커 수")).toHaveTextContent("2");
    });
    await expect(map.getByText("기존 영역 마커 하나")).toBeVisible();
    await expect(canvas.getByText(INITIAL_LIST_ITEM.name)).toBeVisible();
  },
};

export const MoveRequiresConfirmation: Story = {
  beforeEach: installMapApiMock(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const map = within(canvas.getByRole("region", { name: "테스트 지도" }));

    await waitFor(() =>
      expect(hasRequested("/shops/map", INITIAL_BOUNDS)).toBe(true),
    );

    await userEvent.click(map.getByRole("button", { name: "테스트 지도 이동" }));

    const searchButton = await canvas.findByRole("button", {
      name: "이 지역에서 재검색",
    });

    await expect(hasRequested("/shops/map", MOVED_BOUNDS)).toBe(false);
    await expect(hasRequested("/shops", MOVED_BOUNDS)).toBe(false);

    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(hasRequested("/shops/map", MOVED_BOUNDS)).toBe(true);
      expect(hasRequested("/shops", MOVED_BOUNDS)).toBe(true);
    });

    await expect(map.getByText("새 영역 마커")).toBeVisible();
    await expect(canvas.getByText(MOVED_LIST_ITEM.name)).toBeVisible();
  },
};

export const LoadingKeepsPreviousResults: Story = {
  beforeEach: installMapApiMock({ holdMovedRequests: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const map = within(canvas.getByRole("region", { name: "테스트 지도" }));

    await waitFor(() =>
      expect(hasRequested("/shops/map", INITIAL_BOUNDS)).toBe(true),
    );

    await userEvent.click(map.getByRole("button", { name: "테스트 지도 이동" }));
    await userEvent.click(
      await canvas.findByRole("button", { name: "이 지역에서 재검색" }),
    );

    const loadingButton = await canvas.findByRole("button", {
      name: "검색 중...",
    });

    await expect(loadingButton).toBeDisabled();
    await expect(map.getByText("기존 영역 마커 하나")).toBeVisible();
    await expect(canvas.getByText(INITIAL_LIST_ITEM.name)).toBeVisible();

    releaseMovedRequests?.();

    await expect(await map.findByText("새 영역 마커")).toBeVisible();
  },
};

export const FailureKeepsPreviousResults: Story = {
  beforeEach: installMapApiMock({ failMovedMap: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const map = within(canvas.getByRole("region", { name: "테스트 지도" }));

    await waitFor(() =>
      expect(hasRequested("/shops/map", INITIAL_BOUNDS)).toBe(true),
    );

    await userEvent.click(map.getByRole("button", { name: "테스트 지도 이동" }));
    await userEvent.click(
      await canvas.findByRole("button", { name: "이 지역에서 재검색" }),
    );

    const errorAlert = await canvas.findByRole("alert");

    await expect(errorAlert).toHaveTextContent("지도 마커를 불러오지 못했습니다.");
    await expect(map.getByText("기존 영역 마커 하나")).toBeVisible();
    await expect(canvas.getByText(INITIAL_LIST_ITEM.name)).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "이 지역에서 재검색" }),
    ).toBeEnabled();
  },
};

export const TruncatedMarkerGuide: Story = {
  beforeEach: installMapApiMock({ initialMapTruncated: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(hasRequested("/shops/map", INITIAL_BOUNDS)).toBe(true),
    );

    await expect(
      await canvas.findByText("상점이 많아요. 지도를 확대해 주세요."),
    ).toBeVisible();
  },
};

export const InfiniteScrollDoesNotChangeMarkers: Story = {
  beforeEach: () => {
    const restoreFetch = installMapApiMock({ listHasNextPage: true })();
    const restoreIntersectionObserver = installImmediateIntersectionObserver();

    return () => {
      restoreIntersectionObserver();
      restoreFetch();
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const map = within(canvas.getByRole("region", { name: "테스트 지도" }));
    const list = within(
      canvas.getByRole("region", { name: "검색된 소품샵" }),
    );

    await expect(await list.findByText(NEXT_LIST_ITEM.name)).toBeVisible();
    await expect(map.getByLabelText("표시된 마커 수")).toHaveTextContent("2");
    await expect(map.queryByText(NEXT_LIST_ITEM.name)).not.toBeInTheDocument();
  },
};

export const FilterSearchKeepsPreviousResults: Story = {
  beforeEach: installMapApiMock({ holdFilteredRequests: true }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const map = within(canvas.getByRole("region", { name: "테스트 지도" }));
    const list = within(
      canvas.getByRole("region", { name: "검색된 소품샵" }),
    );

    await expect(await map.findByText("기존 영역 마커 하나")).toBeVisible();
    await expect(await list.findByText(INITIAL_LIST_ITEM.name)).toBeVisible();

    await userEvent.click(
      canvas.getByRole("searchbox", { name: "상점 이름 검색" }),
    );

    const searchInput = await canvas.findByRole("searchbox", {
      name: "검색할 상점 입력",
    });

    await userEvent.type(searchInput, FILTER_KEYWORD);

    await waitFor(() => {
      expect(
        requestedUrls.some((requestUrl) => {
          const url = new URL(requestUrl);

          return (
            url.pathname.endsWith("/shops/map") &&
            url.searchParams.get("keyword") === FILTER_KEYWORD
          );
        }),
      ).toBe(true);
    });

    await expect(map.getByText("기존 영역 마커 하나")).toBeVisible();
    await expect(list.getByText(INITIAL_LIST_ITEM.name)).toBeVisible();

    releaseFilteredRequests?.();

    await expect(await map.findByText("필터된 지도 마커")).toBeVisible();
    await expect(await list.findByText(FILTERED_LIST_ITEM.name)).toBeVisible();
  },
};

export const SearchSheetUsesGlobalKeywordQuery: Story = {
  beforeEach: installMapApiMock(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("searchbox", { name: "상점 이름 검색" }),
    );

    await userEvent.type(
      await canvas.findByRole("searchbox", { name: "검색할 상점 입력" }),
      FILTER_KEYWORD,
    );

    await waitFor(() => {
      expect(
        requestedUrls.some((requestUrl) => {
          const url = new URL(requestUrl);

          return (
            url.pathname.endsWith("/shops") &&
            url.searchParams.get("keyword") === FILTER_KEYWORD &&
            !url.searchParams.has("southWestLat")
          );
        }),
      ).toBe(true);
    });

    await expect(await canvas.findByText(GLOBAL_SEARCH_ITEM.name)).toBeVisible();
  },
};
