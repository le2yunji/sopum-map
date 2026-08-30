// app/(main)/(tabs)/_home/_components/HomeCuratedShopSection.tsx
"use client";

import { useHomeCuratedShops } from "@/api/home/home.query";
import { ShopBannerCarousel } from "@/components/ui/ShopBannerCarousel/ShopBannerCarousel";
import { toShopBannerItem } from "../mappers/homeShopBanner.mapper";

export function HomeCuratedShopSection() {
  const { data, isLoading, isError } = useHomeCuratedShops();

  if (isLoading || isError) {
    return null;
  }

  const curatedShops = data?.curatedShops.map(toShopBannerItem) ?? [];

  if (curatedShops.length === 0) {
    return null;
  }

  return (
    <ShopBannerCarousel items={curatedShops} ariaLabel="오늘의 추천 소품샵" />
  );
}
