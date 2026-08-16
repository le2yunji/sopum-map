import type { ShopDetailView } from "../_types/shop-detail.types";

type Props = Readonly<{
  shop: Pick<ShopDetailView, "hours" | "closedDay">;
}>;

export function ShopVisitInfoSection({ shop }: Props) {
  return (
    <section className="mt-2 bg-white px-5 py-8">
      <h2 className="text-16 font-semibold">운영 정보</h2>

      <dl className="mt-4 space-y-3 text-13">
        <div className="flex">
          <dt className="w-20 shrink-0 text-black-500">영업시간</dt>

          <dd>{shop.hours}</dd>
        </div>

        {shop.closedDay ? (
          <div>
            <hr className="mx-auto my-3 h-px border-0 bg-black-100/50" />
            <div className="flex">
              <dt className="w-20 shrink-0 text-black-500">휴무일</dt>
              <dd>{shop.closedDay}</dd>
            </div>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
