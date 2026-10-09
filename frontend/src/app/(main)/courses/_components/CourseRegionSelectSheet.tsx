"use client";

import {
  SHOP_REGION_GROUP_LABELS,
  type PickFolderCourseRegion,
} from "@sopum-map/shared";

import { usePickFolderCourseRegions } from "@/api/pick-folder/pick-folder.query";
import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { StatePanel } from "@/components/ui/StatePanel/StatePanel";

type Props = Readonly<{
  open: boolean;
  folderId: string;
  onOpenChange: (open: boolean) => void;
  onSelect: (region: PickFolderCourseRegion) => void;
}>;

export function CourseRegionSelectSheet({
  open,
  folderId,
  onOpenChange,
  onSelect,
}: Props) {
  const { data, isPending, isError, refetch } = usePickFolderCourseRegions(
    open ? folderId : undefined,
  );

  const regions = data?.items ?? [];

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      ariaLabelledBy="course-region-title"
    >
      <BottomSheet.Handle />

      <BottomSheet.Header>
        <BottomSheet.Title id="course-region-title">
          코스 지역 선택
        </BottomSheet.Title>
      </BottomSheet.Header>

      <BottomSheet.Body>
        {isPending ? (
          <div className="py-8 text-center text-14 text-black-500">
            지역 정보를 불러오는 중...
          </div>
        ) : null}

        {isError ? (
          <StatePanel
            title="코스 지역 정보를 불러오지 못했어요"
            action="다시 시도"
            onAction={() => {
              void refetch();
            }}
          />
        ) : null}

        {!isPending && !isError && regions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-14 text-black-700">
              코스를 만들 수 있는 지역이 없어요.
            </p>

            <p className="mt-2 text-12 text-black-500">
              같은 지역의 상점을 더 저장해주세요.
            </p>
          </div>
        ) : null}

        {!isPending && !isError ? (
          <div className="space-y-3">
            {regions.map((region) => {
              const hasCourse = region.courseId !== null;
              const canCreate = region.availableShopCount >= 2;
              const disabled = !hasCourse && !canCreate;

              return (
                <button
                  key={region.regionGroup}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelect(region);
                  }}
                  className="
                    flex w-full items-center justify-between
                    rounded-xl border border-black-100 p-4 text-left
                    disabled:cursor-not-allowed disabled:opacity-40
                  "
                >
                  <div>
                    <p className="text-15 font-semibold text-black-900">
                      {SHOP_REGION_GROUP_LABELS[region.regionGroup]}
                    </p>

                    <p className="mt-1 text-12 text-black-500">
                      코스에 담을 수 있는 상점 {region.availableShopCount}곳
                    </p>

                    {region.temporarilyClosedShopCount > 0 ? (
                      <p className="mt-1 text-11 text-black-500">
                        임시 휴무 상점 {region.temporarilyClosedShopCount}곳
                        포함
                      </p>
                    ) : null}
                  </div>

                  <span className="text-13 font-medium text-green-700">
                    {hasCourse
                      ? "코스 수정"
                      : canCreate
                        ? "코스 만들기"
                        : "상점 부족"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </BottomSheet.Body>
    </BottomSheet>
  );
}
