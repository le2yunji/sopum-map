import { ShopDetailData } from "@sopum-map/shared";
import { CopyAddressButton } from "./CopyAddressButton";
import { NaverShopMapCanvas } from "./map-canvas/NaverShopMapCanvas";

type Props = Readonly<{
  shop: Pick<
    ShopDetailData,
    "name" | "address" | "latitude" | "longitude" | "naverPlaceUrl"
  >;
}>;

export function ShopLocationSection({ shop }: Props) {
  return (
    <section aria-label="상점 위치" className="mt-2 bg-white px-5 pt-4 pb-2">
      <h2 className="text-16 font-semibold">위치</h2>

      <div className="relative mt-3 aspect-[400/236] overflow-hidden rounded-xl bg-green-100">
        <NaverShopMapCanvas
          name={shop.name}
          latitude={shop.latitude}
          longitude={shop.longitude}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="min-w-0 text-12 text-black-500">{shop.address}</p>
        <CopyAddressButton address={shop.address} />
      </div>
    </section>
  );
}
