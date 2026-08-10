export type ShopDetailImage = Readonly<{
  id: string;
  imageUrl: string;
  alt: string;
}>;

export type ShopReviewPreview = Readonly<{
  id: string;
  authorName: string;
  visitedAt: string;
  content: string;
  tags: readonly string[];
}>;

export type ShopPickFolder = Readonly<{
  id: string;
  name: string;
  shopCount: number;
}>;

export type ShopDetailView = Readonly<{
  id: string;
  name: string;
  categoryLabel: string;
  description?: string;
  images: readonly ShopDetailImage[];
  tags: readonly string[];
  address: string;
  openingHours?: string;
  phone?: string;
  instagramUrl?: string;
  naverMapUrl?: string;
  locationLabel: string;
  isLiked: boolean;
  likeCount: number;
  pickFolders: readonly ShopPickFolder[];
  reviews: readonly ShopReviewPreview[];
}>;

export type ShopDetailViewState = "success" | "loading" | "error";
