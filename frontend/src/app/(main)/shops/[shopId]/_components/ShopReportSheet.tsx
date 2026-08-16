"use client";

import { useState } from "react";

import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button/Button";

const REPORT_REASONS = [
  {
    value: "wrong_address",
    label: "주소가 달라요",
  },
  {
    value: "wrong_hours",
    label: "영업시간이 달라요",
  },
  {
    value: "closed",
    label: "폐점한 매장이에요",
  },
] as const;

type ReportReason = (typeof REPORT_REASONS)[number]["value"];

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (reason: ReportReason) => void;
}>;

export function ShopReportSheet({ open, onOpenChange, onSubmit }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);

  const [reported, setReported] = useState(false);

  const reset = () => {
    setReason(null);
    setReported(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleClose();
      return;
    }

    onOpenChange(true);
  };

  const handleSubmit = () => {
    if (!reason) {
      return;
    }

    onSubmit?.(reason);
    setReported(true);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      ariaLabel="정보 수정 제보"
    >
      {reported ? (
        <div
          role="status"
          aria-label="제보가 접수되었어요"
          className="py-8 text-center"
        >
          <span
            aria-hidden="true"
            className="mx-auto grid size-14 place-items-center rounded-full bg-green-100 text-24 text-green-700"
          >
            ✓
          </span>

          <h2 className="mt-4 text-20 font-semibold">제보가 접수되었어요</h2>

          <p className="mt-2 text-13 text-black-500">
            확인 후 상점 정보에 반영할게요.
          </p>

          <Button fullWidth className="mt-6" onClick={handleClose}>
            닫기
          </Button>
        </div>
      ) : (
        <>
          <BottomSheet.Handle />

          <BottomSheet.Header>
            <BottomSheet.Title>어떤 정보가 잘못되었나요?</BottomSheet.Title>
          </BottomSheet.Header>

          <BottomSheet.Body>
            <fieldset className="space-y-3">
              <legend className="sr-only">제보 사유 선택</legend>

              {REPORT_REASONS.map(({ value, label }) => (
                <label key={value} className="flex min-h-11 items-center gap-3">
                  <input
                    type="radio"
                    name="report-reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                  />

                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
          </BottomSheet.Body>

          <BottomSheet.Footer>
            <Button fullWidth disabled={!reason} onClick={handleSubmit}>
              제보하기
            </Button>
          </BottomSheet.Footer>
        </>
      )}
    </BottomSheet>
  );
}
