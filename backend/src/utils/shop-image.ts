type ShopImageCandidate = {
  imageUrl: string;
  isMain?: boolean | null;
  order?: number | null;
};

/**
 * 대표 지정 이미지를 우선하고,
 * 없으면 노출 순서가 가장 빠른 이미지를 선택합니다.
 */
export const getMainShopImageUrl = (
  images: readonly ShopImageCandidate[],
): string | null => {
  const sortedImages = [...images].sort(
    (first, second) => (first.order ?? 0) - (second.order ?? 0),
  );

  const mainImage =
    sortedImages.find((image) => image.isMain) ?? sortedImages[0];

  return mainImage?.imageUrl ?? null;
};
