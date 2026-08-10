import Image from "next/image";

import { DEFAULT_IMAGES } from "@/constants/image.constants";

import type { ShopDetailImage } from "../_types/shop-detail.types";

type ShopImageGalleryProps = Readonly<{
  images: readonly ShopDetailImage[];
  shopName: string;
}>;

/** 상점 대표 이미지를 안정적인 비율과 대체 이미지로 표시합니다. */
export function ShopImageGallery({ images, shopName }: ShopImageGalleryProps) {
  const currentImage = images[0];

  return (
    <section aria-label={`${shopName} 이미지`} className="relative aspect-[4/3] overflow-hidden bg-black-100">
      <Image
        src={currentImage?.imageUrl ?? DEFAULT_IMAGES.shop}
        alt={currentImage?.alt ?? `${shopName} 기본 이미지`}
        fill
        preload
        sizes="(max-width: 480px) 100vw, 480px"
        className="object-cover"
      />
      <span className="absolute bottom-4 right-4 rounded-full bg-black-950/65 px-3 py-1 text-12 text-white">
        1 / {Math.max(images.length, 1)}
      </span>
    </section>
  );
}
