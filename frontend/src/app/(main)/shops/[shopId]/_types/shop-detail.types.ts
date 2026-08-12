export type ShopReviewPreview = Readonly<{
  id: string;
  author: string;
  avatarUrl: string;
  date: string;
  content: string;
  imageUrls: readonly string[];
}>;

export type ShopDetailView = Readonly<{
  id: string;
  name: string;
  category: string;
  distance: string;
  tags: readonly string[];
  imageUrls: readonly string[];
  mapImageUrl?: string;
  address: string;
  hours: string;
  closedDay?: string;
  likeCount: number;
  reviewCount: number;
  reviews: readonly ShopReviewPreview[];
}>;

export type ShopDetailViewState = "success" | "loading" | "error";
