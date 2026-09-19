import Image from "next/image";
import Link from "next/link";

import { PickButton } from "@/components/pick/PickButton";
import type { ShopCardProps, ShopCardVariant } from "./ShopCard.types";

const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";

const cardClassNames: Record<ShopCardVariant, string> = {
  default: "relative flex max-w-40 flex-col gap-3",
  compact: "relative flex max-w-40 flex-col gap-2",
};

const imageWrapperClassNames: Record<ShopCardVariant, string> = {
  default:
    "relative aspect-square w-full overflow-hidden rounded-xl border border-gray-100",
  compact:
    "relative aspect-square w-full overflow-hidden rounded-lg border border-gray-100",
};

const titleClassNames: Record<ShopCardVariant, string> = {
  default: "text-base font-semibold",
  compact: "text-sm font-semibold",
};

export const ShopCard = ({
  name,
  href,
  imageUrl,
  region,
  tags,
  isLiked = false,
  isLikePending = false,
  variant = "default",
  onLikeClick,
}: ShopCardProps) => {
  const isCompact = variant === "compact";

  return (
    <article className={cardClassNames[variant]}>
      {/* 카드 전체 클릭 영역 */}
      <Link
        href={href}
        aria-label={`${name} 상세 보기`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
      />

      <div className={imageWrapperClassNames[variant]}>
        <Image
          src={imageUrl || DEFAULT_SHOP_IMAGE}
          alt={`${name} 매장 이미지`}
          fill
          className="object-cover"
          sizes="160px"
        />

        {!isCompact && (
          <PickButton
            isLiked={isLiked}
            isPending={isLikePending}
            onToggleLike={onLikeClick}
            className="absolute right-0 bottom-0 z-20"
          />
        )}
      </div>

      <div className="min-w-0">
        <h3 className={`${titleClassNames[variant]} truncate`}>{name}</h3>

        <div>
          {tags.map((tag) => (
            <span className="mr-1 mb-1 text-xs text-gray-500" key={tag}>
              #{tag}
            </span>
          ))}
        </div>

        <p className="mt-1 truncate text-xs text-gray-700">{region}</p>
      </div>
    </article>
  );
};
