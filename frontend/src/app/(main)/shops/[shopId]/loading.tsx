import { ShopDetailScreen } from "./_components/ShopDetailScreen";

/** 상점 상세 경로가 준비되는 동안 같은 크기의 뼈대 화면을 표시합니다. */
export default function ShopDetailLoading() {
  return <ShopDetailScreen state="loading" />;
}
