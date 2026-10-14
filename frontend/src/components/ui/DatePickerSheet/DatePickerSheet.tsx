"use client";

import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import { useId, useState } from "react";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

type Props = Readonly<{
  label: string;
  value: string;
  maxDateValue: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  disabled?: boolean;
}>;

/** YYYY-MM-DD 값을 시간대 변화 없는 로컬 Date로 바꿉니다. */
function parseDateValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day, 12);
}

/** 달력에서 고른 로컬 날짜를 폼의 YYYY-MM-DD 값으로 바꿉니다. */
function formatDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** 방문일 버튼에 읽기 쉬운 한국어 날짜를 표시합니다. */
function formatDisplayDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(parseDateValue(value));
}

/** 날짜 버튼과 접근 가능한 바텀시트 달력을 한 입력으로 제공합니다. */
export function DatePickerSheet({
  label,
  value,
  maxDateValue,
  onChange,
  errorMessage,
  disabled = false,
}: Props) {
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => parseDateValue(value));
  const selectedDate = parseDateValue(value);
  const maxDate = parseDateValue(maxDateValue);
  const accessibleDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(selectedDate);

  /** 열 때 저장된 값을 다시 불러와 취소한 선택이 남지 않게 합니다. */
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftDate(selectedDate);
    }

    setOpen(nextOpen);
  };

  /** 임시 선택을 폼 값으로 확정하고 달력을 닫습니다. */
  const confirmSelection = () => {
    onChange(formatDateValue(draftDate));
    setOpen(false);
  };

  return (
    <div className="pt-4">
      <span className="block text-14 font-semibold">{label}</span>
      <button
        type="button"
        aria-label={`${label} 선택, ${accessibleDate}`}
        aria-describedby={errorMessage ? errorId : undefined}
        disabled={disabled}
        onClick={() => handleOpenChange(true)}
        className={`mt-2 flex min-h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-14 outline-none transition-colors hover:border-green-500 focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/20 disabled:bg-black-100 disabled:text-black-400 ${
          errorMessage ? "border-red-600" : "border-black-200"
        }`}
      >
        <span>{formatDisplayDate(value)}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-5 text-green-700"
        >
          <path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
        </svg>
      </button>

      {errorMessage && (
        <p id={errorId} role="alert" className="mt-1 text-12 text-red-600">
          {errorMessage}
        </p>
      )}

      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
        ariaLabelledBy="date-picker-title"
      >
        <BottomSheet.Handle />
        <BottomSheet.Header>
          <BottomSheet.Title id="date-picker-title">{label} 선택</BottomSheet.Title>
        </BottomSheet.Header>
        <BottomSheet.Body className="mt-4">
          <DayPicker
            mode="single"
            required
            autoFocus
            locale={ko}
            selected={draftDate}
            defaultMonth={draftDate}
            endMonth={maxDate}
            disabled={{ after: maxDate }}
            onSelect={setDraftDate}
            footer={`${formatDisplayDate(formatDateValue(draftDate))} 선택됨`}
            classNames={{
              root: "relative w-full",
              months: "w-full",
              month: "w-full",
              month_caption: "flex h-11 items-center justify-center",
              caption_label: "text-16 font-semibold text-black-950",
              nav: "absolute inset-x-0 top-0 flex h-11 items-center justify-between",
              button_previous: "grid size-11 place-items-center rounded-full text-black-800 hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-green-500",
              button_next: "grid size-11 place-items-center rounded-full text-black-800 hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-green-500",
              chevron: "size-5 fill-current",
              month_grid: "w-full table-fixed border-collapse",
              weekdays: "h-9",
              weekday: "text-12 font-medium text-black-400",
              week: "h-11",
              day: "p-0 text-center text-14",
              day_button: "mx-auto grid size-10 place-items-center rounded-full hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-green-500",
              selected: "[&>button]:bg-green-500 [&>button]:font-semibold [&>button]:text-white! [&>button]:hover:bg-green-600",
              today: "[&>button]:font-bold [&>button]:text-green-700",
              disabled: "[&>button]:cursor-not-allowed [&>button]:text-black-300 [&>button]:hover:bg-transparent",
              outside: "[&>button]:text-black-300",
              footer: "sr-only",
            }}
          />
        </BottomSheet.Body>
        <BottomSheet.Footer className="gap-2">
          <Button
            variant="outline"
            fullWidth
            onClick={() => handleOpenChange(false)}
          >
            취소
          </Button>
          <Button fullWidth onClick={confirmSelection}>
            선택 완료
          </Button>
        </BottomSheet.Footer>
      </BottomSheet>
    </div>
  );
}
