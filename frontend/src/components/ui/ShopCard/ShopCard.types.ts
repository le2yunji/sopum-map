export type ShopCardVariant = "default" | "compact";

export interface ShopCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  region: string;
  tags: string[];
  isLiked?: boolean;
  variant?: ShopCardVariant;
  onLikeClick?: () => void;
}
