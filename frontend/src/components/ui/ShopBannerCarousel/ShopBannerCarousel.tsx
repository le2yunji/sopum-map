import Image from "next/image";
import Link from "next/link";

import type { ShopBannerCarouselProps } from "./ShopBannerCarousel.types";

const EAGER_IMAGE_COUNT = 2;

export const ShopBannerCarousel = ({
  items,
  ariaLabel = "추천 소품샵",
  className = "",
}: ShopBannerCarouselProps) => {
  if (items.length === 0) {
    return null;
  }

  const eagerImageUrls = new Set(
    items.slice(0, EAGER_IMAGE_COUNT).map((item) => item.imageUrl),
  );

  return (
    <section aria-label={ariaLabel} className={className}>
      <ul
        className="
          flex snap-x snap-mandatory gap-4
          overflow-x-auto overscroll-x-contain
          px-4 pb-2 scroll-smooth
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {items.map((item) => {
          return (
            <li
              key={item.id}
              className="
                w-[calc(100vw-48px)] max-w-[298px]
                shrink-0 snap-center
              "
            >
              <Link
                href={`/shops/${item.id}`}
                aria-label={`${item.name} 상세 보기`}
                className="
                  group relative block
                  aspect-[149/168] w-full
                  overflow-hidden rounded-card-lg
                  bg-surface-muted
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-brand-accent
                "
              >
                <Image
                  fill
                  loading={eagerImageUrls.has(item.imageUrl) ? "eager" : "lazy"}
                  src={item.imageUrl}
                  alt={`${item.name} 매장 이미지`}
                  sizes="(max-width: 480px) calc(100vw - 48px), 298px"
                  className="
                    object-cover
                    transition-transform duration-300
                    group-hover:scale-[1.02]
                  "
                />

                {/* 하단 이미지 대비용 그라데이션 */}
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute inset-0
                    bg-linear-to-t
                    from-black-950/10
                    via-transparent
                    to-transparent
                  "
                />

                <div
                  className="
                      absolute inset-x-3 bottom-3
                      rounded-card-lg
                      border border-white/50
                      bg-white/20 px-4 py-4
                      shadow-lg backdrop-blur-md
                    "
                >
                  {/* 큐레이터 한 줄 소개 */}
                  {item.curatorText && (
                    <p className="mb-1 line-clamp-1 text-14 text-fg-secondary">
                      {item.curatorText}
                    </p>
                  )}

                  {/* 상점명 */}
                  <p className="truncate text-18 font-semibold text-fg-primary">
                    {item.name}
                  </p>

                  {/* 지역 / 설명 */}
                  {(item.region || item.description) && (
                    <div className="mt-1 flex items-center gap-1.5 text-14 text-fg-secondary">
                      {item.region && (
                        <span className="shrink-0">{item.region}</span>
                      )}

                      {item.region && item.description && (
                        <span aria-hidden="true" className="opacity-40">
                          ·
                        </span>
                      )}

                      {item.description && (
                        <span className="min-w-0 truncate">
                          {item.description}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 태그 */}
                  {item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span key={tag.id}>#{tag.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
