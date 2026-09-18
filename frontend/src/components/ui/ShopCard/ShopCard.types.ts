export type ShopCardVariant = "default" | "compact";

export interface ShopCardProps {
  id: string;
  name: string;
  href: string;
  imageUrl?: string | null;
  region: string;
  tags: string[];
  isLiked?: boolean;
  isLikePending?: boolean;
  variant?: ShopCardVariant;
  onLikeClick?: () => void;
}
