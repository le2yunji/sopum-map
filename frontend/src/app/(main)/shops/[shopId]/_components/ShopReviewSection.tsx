import Image from "next/image";
import type { ShopDetailView } from "../_types/shop-detail.types";

type Props = Readonly<{
  shop: Pick<ShopDetailView, "reviews" | "reviewCount" | "likeCount">;
}>;

export function ShopReviewSection({ shop }: Props) {
  return (
    <section className="mt-2 bg-white px-5 py-6">
      <h2 className="flex items-center gap-1.5 text-16 font-semibold">
        후기 {shop.reviewCount}개
      </h2>

      {shop.reviews.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-14 text-black-500">
            아직 등록된 방문 후기가 없어요
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-7">
          {shop.reviews.map((review, reviewIndex) => (
            <article key={review.id}>
              <div className="flex items-center gap-2">
                <Image
                  width={32}
                  height={32}
                  src={review.avatarUrl}
                  alt=""
                  className="size-8 rounded-full object-cover"
                />

                <div>
                  <h3 className="text-13 font-semibold">{review.author}</h3>
                  <p className="text-10 text-black-400">{review.date}</p>
                </div>
              </div>

              {review.imageUrls.length > 0 ? (
                <div
                  className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  aria-label={`${review.author}님의 방문 사진`}
                >
                  {review.imageUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="relative aspect-square w-[calc((100%-2rem)/2)] shrink-0 snap-start overflow-hidden rounded-lg"
                    >
                      <Image
                        fill
                        loading={
                          reviewIndex === 0 && index === 0 ? "eager" : "lazy"
                        }
                        src={url}
                        alt={`${review.author}님의 방문 사진 ${index + 1}`}
                        className="object-cover"
                        sizes="(max-width: 480px) calc((100vw - 72px) / 2), 204px"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              <p className="mt-3 pb-3 text-13 leading-5 text-black-800">
                {review.content}
              </p>
              <hr className="mx-auto my-3 h-px border-0 bg-black-100/50" />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
