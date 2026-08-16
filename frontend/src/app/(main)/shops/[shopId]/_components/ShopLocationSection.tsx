import Image from "next/image";
import type { ShopDetailView } from "../_types/shop-detail.types";

type Props = Readonly<{
  shop: Pick<ShopDetailView, "name" | "mapImageUrl" | "address">;
}>;

const DEFAULT_MAP_IMAGE = "/images/profiles/shop_default.webp";

export function ShopLocationSection({ shop }: Props) {
  return (
    <section aria-label="상점 위치" className="mt-2 bg-white px-5 py-6">
      <h2 className="text-16 font-semibold">위치</h2>

      <div className="relative mt-3 aspect-[345/236] overflow-hidden rounded-xl bg-green-100">
        <Image
          fill
          loading="eager"
          src={shop.mapImageUrl ?? DEFAULT_MAP_IMAGE}
          alt={`${shop.name} 위치 지도`}
          className="object-cover"
          sizes="(max-width: 480px) calc(100vw - 40px), 440px"
        />
      </div>

      <p className="mt-2 text-12 text-black-500">{shop.address}</p>
    </section>
  );
}
