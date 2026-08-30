import Image from "next/image";
import Link from "next/link";

import type { ShopBannerCarouselProps } from "./ShopBannerCarousel.types";

export const ShopBannerCarousel = ({
  items,
  ariaLabel = "추천 소품샵",
  className = "",
}: ShopBannerCarouselProps) => {
  if (items.length === 0) {
    return null;
  }

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
        {items.map((item, index) => {
          return (
            <li
              key={index}
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
                  overflow-hidden rounded-3xl
                  bg-black-100
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-green-500
                "
              >
                <Image
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  src={item.imageUrl}
                  alt={`${item.name} 매장 이미지`}
                  sizes="(max-width: 480px) calc(100vw - 48px), 298px"
                  className="
                    object-cover
                    transition-transform duration-300
                    group-hover:scale-[1.02]
                  "
                />

                <div
                  aria-hidden="true"
                  className="
                    absolute inset-0
                    bg-linear-to-t
                    from-black-950/10 via-transparent to-transparent
                  "
                />

                <div
                  className="
                    absolute inset-x-3 bottom-3
                    rounded-[20px]
                    border border-white/50
                    bg-white/30 px-4 py-4
                    shadow-lg backdrop-blur-sm
                  "
                >
                  <p className="mt-0.5 truncate text-14 text-black-800">
                    {item.curatorText && ` · ${item.curatorText}`}
                  </p>

                  <p className="line-clamp-1 text-18 font-semibold text-black-950">
                    {item.name}
                  </p>

                  <p className="mt-0.5 truncate text-14 text-black-800">
                    {item.region} · {item.description}
                  </p>

                  {item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.slice(0, 3).map((tag) => {
                        return (
                          <span
                            key={tag.id}
                            className="
                              rounded-full
                              bg-green-100/80 px-2 py-1
                              text-12 font-medium text-green-900
                            "
                          >
                            #{tag.name}
                          </span>
                        );
                      })}
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
