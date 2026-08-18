export type MapShop = {
  id: string;
  name: string;
  address: string;
  region: string;
  tags: string[];
  imageUrl: string;
  isLiked: boolean;

  latitude: number;
  longitude: number;
};

export type MapSdkState = "loading" | "ready" | "error" | "missing-key";
