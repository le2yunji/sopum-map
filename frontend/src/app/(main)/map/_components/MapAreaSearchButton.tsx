import { Button } from "@/components/ui/Button/Button";

type MapAreaSearchButtonProps = Readonly<{
  isSearching: boolean;
  onSearch: () => void;
}>;

/** 현재 지도 영역의 상점 재검색 동작을 제공합니다. */
export function MapAreaSearchButton({
  isSearching,
  onSearch,
}: MapAreaSearchButtonProps) {
  return (
    <div
      className="
        pointer-events-none
        absolute inset-x-0 top-32 z-30
        flex justify-center px-4
      "
    >
      <Button
        type="button"
        variant="outline"
        size="small"
        disabled={isSearching}
        aria-busy={isSearching || undefined}
        aria-live="polite"
        onClick={onSearch}
        className="
          pointer-events-auto
          rounded-full
          border-black-100
          bg-white
          px-4
          shadow-md
        "
      >
        {isSearching ? "검색 중..." : "이 지역에서 재검색"}
      </Button>
    </div>
  );
}
