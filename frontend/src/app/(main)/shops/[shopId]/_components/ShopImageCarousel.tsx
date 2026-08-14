"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { ChevronLeftIcon, HeartIcon, PenIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";

type ShopImageCarouselProps = Readonly<{
  shopName: string;
  shopCategory: string;
  imageUrls: readonly string[];
  isLiked: boolean;
  onToggleLike: () => void;
  onReport: () => void;
  backHref?: string;
  fallbackImageUrl?: string;
}>;

/**
 * 매장 이미지를 좌우 스와이프로 탐색할 수 있는 상세 이미지 캐러셀입니다.
 *
 * @example
 * ```tsx
 * <ShopImageCarousel
 *   shopName={shop.name}
 *   imageUrls={imageUrls}
 *   isLiked={isLiked}
 *   onToggleLike={() => setLiked((prev) => !prev)}
 *   onReport={() => setSheet("report")}
 * />
 * ```
 */
export function ShopImageCarousel({
  shopName,
  shopCategory,
  imageUrls,
  isLiked,
  onToggleLike,
  onReport,
  backHref = "/",
  fallbackImageUrl = "/images/profiles/shop_default.webp",
}: ShopImageCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [imageIndex, setImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(
    () => new Set(),
  );

  const images = imageUrls.length > 0 ? imageUrls : [fallbackImageUrl];

  const handleScroll = () => {
    const container = scrollRef.current;

    if (!container || container.clientWidth === 0) {
      return;
    }

    const nextIndex = Math.round(container.scrollLeft / container.clientWidth);

    if (nextIndex !== imageIndex) {
      setImageIndex(nextIndex);
    }
  };

  const handleImageError = (index: number) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(index);

      return next;
    });
  };

  return (
    <section
      className="relative h-[318px] overflow-hidden bg-black-300"
      aria-label="상점 이미지"
    >
      <div
        ref={scrollRef}
        tabIndex={0}
        onScroll={handleScroll}
        className="
          flex h-full
          snap-x snap-mandatory
          overflow-x-auto overscroll-x-contain
          focus-visible:outline-2
          focus-visible:outline-green-700
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {images.map((imageUrl, index) => {
          const src = failedImages.has(index) ? fallbackImageUrl : imageUrl;

          return (
            <div
              key={`${imageUrl}-${index}`}
              className="
                relative h-full w-full
                shrink-0 snap-center
              "
            >
              <Image
                fill
                loading={index === 0 ? "eager" : "lazy"}
                src={src}
                alt={`${shopName} 매장 이미지 ${index + 1}`}
                sizes="(max-width: 480px) 100vw, 480px"
                className="object-cover"
                onError={() => handleImageError(index)}
              />
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-4 top-5 flex justify-between">
        <Link
          href={backHref}
          aria-label="뒤로가기"
          className="
            grid size-11 place-items-center
            rounded-full bg-white/90
            active:bg-black-100
            focus-visible:outline-2
            focus-visible:outline-green-700
          "
        >
          <ChevronLeftIcon className="size-5" />
        </Link>

        <div className="flex gap-2">
          <Button
            iconOnly
            size="small"
            variant="ghost"
            aria-pressed={isLiked}
            aria-label={isLiked ? "좋아요 취소" : "좋아요 추가"}
            onClick={onToggleLike}
            className="bg-white/90! active:bg-black-100!"
          >
            <HeartIcon
              fill={isLiked ? "currentColor" : "none"}
              className={isLiked ? "text-red-600" : "text-black-950"}
            />
          </Button>

          <Button
            iconOnly
            size="small"
            variant="ghost"
            aria-label="정보 수정 제보"
            onClick={onReport}
            className="bg-white/90! active:bg-black-100!"
          >
            <PenIcon data-testid="pen-icon" />
          </Button>
        </div>
      </div>

      <Badge className="absolute w-3 right-4 bottom-8.5 z-10 bg-green-100/70 text-green-800">
        {shopCategory}
      </Badge>

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center py-4">
          <span
            aria-live="polite"
            className="
              rounded-full bg-black-950/60
              px-3 py-1
              text-12 text-white
            "
          >
            {imageIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </section>
  );
}
