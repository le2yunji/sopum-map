import Image from "next/image";
import Link from "next/link";

import { PickButton } from "@/components/pick/PickButton";
import type { ShopCardProps, ShopCardVariant } from "./ShopCard.types";

const DEFAULT_SHOP_IMAGE = "/images/profiles/shop_default.webp";

const cardClassNames: Record<ShopCardVariant, string> = {
  default: "relative flex max-w-40 flex-col",
  compact: "relative flex max-w-40 flex-col",
};

const imageWrapperClassNames: Record<ShopCardVariant, string> = {
  default:
    "relative aspect-square w-full overflow-hidden rounded-card bg-surface-muted",
  compact:
    "relative aspect-square w-full overflow-hidden rounded-control bg-surface-muted",
};

const linkRadiusClassNames: Record<ShopCardVariant, string> = {
  default: "rounded-card",
  compact: "rounded-control",
};

export const ShopCard = ({
  name,
  href,
  imageUrl,
  region,
  tags,
  likeCount,
  reviewCount,
  isLiked = false,
  isLikePending = false,
  variant = "default",
  onLikeClick,
}: ShopCardProps) => {
  const isCompact = variant === "compact";

  return (
    <article className={cardClassNames[variant]}>
      <Link
        href={href}
        aria-label={`${name} 상세 보기`}
        className={`
          absolute inset-0 z-10
          ${linkRadiusClassNames[variant]}
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-brand
        `}
      />

      <div className={imageWrapperClassNames[variant]}>
        <Image
          src={imageUrl || DEFAULT_SHOP_IMAGE}
          alt={`${name} 매장 이미지`}
          fill
          sizes="160px"
          className="
            object-cover
            transition-transform duration-300
            hover:scale-[1.02]
          "
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

      <div className="mt-3 min-w-0">
        <h3 className="truncate text-16 font-semibold text-fg-primary">
          {name}
        </h3>

        <div className="mt-1 flex items-center gap-2 text-14 text-fg-tertiary">
          <span className="min-w-0 truncate font-semibold">{region}</span>
        </div>

        {tags.length > 0 && (
          <p className="mt-1.5 truncate text-12 text-fg-secondary">
            {tags
              .slice(0, 2)
              .map((tag) => `#${tag}`)
              .join(" · ")}

            {tags.length > 2 && ` · +${tags.length - 2}`}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2 text-12 text-fg-tertiary">
          <span className="shrink-0">
            ♥ {likeCount} · 후기 {reviewCount}
          </span>
        </div>
      </div>
    </article>
  );
};
