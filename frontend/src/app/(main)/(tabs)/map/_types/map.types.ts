export type MapCategory = "all" | "interior" | "character" | "gift" | "miniature";

export type MapShop = {
  id: string;
  name: string;
  address: string;
  region: string;
  category: Exclude<MapCategory, "all">;
  tags: string[];
  imageUrl: string;
  latitude: number;
  longitude: number;
  isLiked: boolean;
};

export type MapSdkState = "loading" | "ready" | "error" | "missing-key";
