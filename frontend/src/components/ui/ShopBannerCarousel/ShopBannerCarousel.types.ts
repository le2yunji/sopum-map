// ShopBannerCarousel.types.ts

export type ShopBannerTag = {
  id: string;
  name: string;
};

export type ShopBannerItem = {
  id: string;
  href: string;
  name: string;
  imageUrl: string;
  imageAlt?: string;
  region: string;
  curatorText?: string;
  description: string;
  tags: ShopBannerTag[];
};

export type ShopBannerCarouselProps = {
  items: ShopBannerItem[];
  ariaLabel?: string;
  className?: string;
};
