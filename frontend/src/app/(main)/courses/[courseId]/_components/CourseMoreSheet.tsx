"use client";

import { BottomSheet } from "@/components/ui/BottomSheet";

import {
  COURSE_DETAIL_SHEET_HANDLE_CLASS_NAME,
  COURSE_DETAIL_SHEET_HORIZONTAL_PADDING_CLASS_NAME,
  COURSE_DETAIL_SHEET_SURFACE_CLASS_NAME,
} from "./course-detail-sheet.styles";

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}>;

/** 소유자 전용 수정·삭제 액션을 상세 본문 밖에 모읍니다. */
export function CourseMoreSheet({
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: Props) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel="코스 더보기"
      className={`min-h-[200px] ${COURSE_DETAIL_SHEET_SURFACE_CLASS_NAME} ${COURSE_DETAIL_SHEET_HORIZONTAL_PADDING_CLASS_NAME}`}
    >
      <BottomSheet.Handle className={COURSE_DETAIL_SHEET_HANDLE_CLASS_NAME} />
      <BottomSheet.Body className="mt-3! space-y-1">
        <button
          type="button"
          onClick={onEdit}
          className="min-h-12 w-full rounded-control px-4 text-left text-15 font-semibold hover:bg-black-50 focus-visible:outline-2 focus-visible:outline-green-700"
        >
          코스 수정
        </button>
        <hr className="h-px border-0 bg-black-100/50" />
        <button
          type="button"
          onClick={onDelete}
          className="min-h-12 w-full rounded-control px-4 text-left text-15 font-semibold text-red-600 hover:bg-black-50 focus-visible:outline-2 focus-visible:outline-green-700"
        >
          코스 삭제
        </button>
      </BottomSheet.Body>
    </BottomSheet>
  );
}
