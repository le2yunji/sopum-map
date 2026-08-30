import type { ShopBannerItem } from "@/components/ui/ShopBannerCarousel/ShopBannerCarousel.types";

export type HomeCategory = Readonly<{
  value: string;
  label: string;
}>;

export type HomeShop = Readonly<{
  id: string;
  name: string;
  imageUrl: string;
  region: string;
  tags: string[];
  isLiked?: boolean;
}>;

export type HomeCourse = Readonly<{
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
  tags: string[];
}>;

export type HomeCurationData = Readonly<{
  curation: ShopBannerItem[];
  categories: HomeCategory[];
  shopsByCategory: Readonly<Record<string, HomeShop[]>>;
  courses: HomeCourse[];
}>;
