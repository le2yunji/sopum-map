import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
/** 마이페이지가 준비되는 동안 레이아웃 크기를 유지합니다. */
export default function Loading() { return <main className="p-4 pt-12"><Skeleton label="마이페이지를 불러오는 중" className="h-[70dvh] rounded-2xl"/></main>; }
