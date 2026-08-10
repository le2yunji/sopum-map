"use client";

import Image from "next/image";
import { useState } from "react";

import { DEFAULT_IMAGES } from "@/constants/image.constants";

import type { ShopDetailImage } from "../_types/shop-detail.types";

type ShopImageGalleryProps = Readonly<{
  images: readonly ShopDetailImage[];
  shopName: string;
}>;

/** 상점 대표 이미지를 안정적인 비율과 대체 이미지로 표시합니다. */
export function ShopImageGallery({ images, shopName }: ShopImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  /** 마지막 이미지 다음에는 첫 이미지가 이어지도록 이동합니다. */
  function showNextImage() {
    setCurrentIndex((index) => (index + 1) % images.length);
  }

  /** 첫 이미지 이전에는 마지막 이미지가 이어지도록 이동합니다. */
  function showPreviousImage() {
    setCurrentIndex((index) => (index - 1 + images.length) % images.length);
  }

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
      {hasMultipleImages ? (
        <>
          <button
            type="button"
            aria-label="이전 이미지 보기"
            onClick={showPreviousImage}
            className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black-950/55 text-20 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="다음 이미지 보기"
            onClick={showNextImage}
            className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black-950/55 text-20 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ›
          </button>
        </>
      ) : null}
      <span className="absolute bottom-4 right-4 rounded-full bg-black-950/65 px-3 py-1 text-12 text-white">
        {currentIndex + 1} / {Math.max(images.length, 1)}
      </span>
    </section>
  );
}
