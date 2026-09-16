import {
  ShopBusinessDay,
  ShopBusinessHour,
  ShopDetailData,
} from "@sopum-map/shared";

type Props = Readonly<{
  shop: Pick<ShopDetailData, "businessHours">;
}>;

const BUSINESS_DAY_LABELS: Record<ShopBusinessDay, string> = {
  monday: "월",
  tuesday: "화",
  wednesday: "수",
  thursday: "목",
  friday: "금",
  saturday: "토",
  sunday: "일",
};

export function formatBusinessHour(hour: ShopBusinessHour) {
  const day = BUSINESS_DAY_LABELS[hour.day];

  if (hour.isClosed) {
    return `${day} 휴무`;
  }

  const periods = hour.periods
    .map(({ open, close }) => `${open} - ${close}`)
    .join(", ");

  return `${day} ${periods}`;
}

export function ShopVisitInfoSection({ shop }: Props) {
  return (
    <section className="mt-2 bg-white px-5 pt-4 pb-5">
      <h2 className="text-16 font-semibold">운영 정보</h2>

      <dl className="mt-4 space-y-3 text-14">
        <div className="flex">
          <dt className="w-20 shrink-0 text-black-500">영업시간</dt>

          {shop.businessHours.map((businessHour) => (
            <p key={businessHour.day}>{formatBusinessHour(businessHour)}</p>
          ))}
        </div>

        {shop.businessHours ? (
          <div>
            <hr className="mx-auto my-3 h-px border-0 bg-black-100/50" />
            <div className="flex">
              <dt className="w-20 shrink-0 text-black-500">휴무일</dt>
              <dd>
                {shop.businessHours.map((businessHour) => (
                  <p key={businessHour.day}>
                    {formatBusinessHour(businessHour)}
                  </p>
                ))}
              </dd>
            </div>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
