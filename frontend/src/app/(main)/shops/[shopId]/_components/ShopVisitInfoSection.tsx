import type { ShopDetailData } from "@sopum-map/shared";

import {
  formatBusinessPeriods,
  formatClosedDays,
  groupBusinessHours,
} from "../_utils/business-hours";

type Props = Readonly<{
  shop: Pick<ShopDetailData, "businessHours" | "businessHoursNote">;
}>;

export function ShopVisitInfoSection({ shop }: Props) {
  const groupedBusinessHours = groupBusinessHours(shop.businessHours);

  const closedDays = formatClosedDays(shop.businessHours);

  return (
    <section className="mt-2 bg-white px-5 pt-4 pb-5">
      <div className="flex items-end justify-between">
        <h2 className="text-16 font-semibold">운영 정보</h2>

        <span className="text-12 text-black-400">* 매장 안내 기준</span>
      </div>

      <dl className="mt-4 space-y-4 text-14">
        <div className="flex">
          <dt className="w-20 shrink-0 text-black-500">영업시간</dt>

          <dd className="min-w-0 flex-1 space-y-2">
            {groupedBusinessHours.length > 0 ? (
              groupedBusinessHours
                .filter((group) => !group.isClosed)
                .map((group) => (
                  <div
                    key={group.days.join("-")}
                    className="flex justify-between gap-4"
                  >
                    <span className="shrink-0 text-black-800">
                      {group.dayLabel}
                    </span>

                    <span className="text-right text-black-800">
                      {formatBusinessPeriods(group)}
                    </span>
                  </div>
                ))
            ) : (
              <p className="text-black-400">영업시간 정보 없음</p>
            )}
          </dd>
        </div>

        <hr className="h-px border-0 bg-black-100/50" />

        <div className="flex">
          <dt className="w-20 shrink-0 text-black-500">휴무일</dt>

          <dd className="text-black-800">{closedDays}</dd>
        </div>
      </dl>

      {shop.businessHoursNote && (
        <p className="mt-4 text-12 leading-5 text-black-400">
          {shop.businessHoursNote}
        </p>
      )}
    </section>
  );
}
