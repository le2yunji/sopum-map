"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { BackButton } from "@/components/navigation/BackButton";

type CourseShop = Readonly<{
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  naverMapUrl: string;
}>;
const DEFAULT_SHOPS: readonly CourseShop[] = [
  {
    id: "on-the-desk",
    name: "온더데스크",
    description: "귀엽고 예쁜 엽서와 편지지가 가득한 곳입니다.",
    imageUrl: "/images/shops/shop_example.png",
    naverMapUrl: "https://map.naver.com/p/search/온더데스크",
  },
  {
    id: "letter-for-you",
    name: "레터포유",
    description: "친구에게 선물할 편지와 문구를 고르기 좋은 곳입니다.",
    imageUrl: "/images/profiles/shop_default.webp",
    naverMapUrl: "https://map.naver.com/p/search/레터포유",
  },
  {
    id: "sunshine",
    name: "선샤인",
    description: "서울숲 산책 끝에 들르기 좋은 소품샵입니다.",
    imageUrl: "/images/brand/mascot-v2.webp",
    naverMapUrl: "https://map.naver.com/p/search/선샤인",
  },
];
type Props = Readonly<{
  courseId?: string;
  shops?: readonly CourseShop[];
  isOwner?: boolean;
  state?: "success" | "loading" | "error";
  onRetry?: () => void;
  onDelete?: () => void;
}>;

/** 코스 정보와 방문 순서를 한 흐름으로 보여줍니다. */
export function CourseDetailScreen({
  courseId = "seoul-forest-postcard",
  shops = DEFAULT_SHOPS,
  isOwner = false,
  state = "success",
  onRetry = () => window.location.reload(),
  onDelete = () => undefined,
}: Props) {
  const [deletePending, setDeletePending] = useState(false);
  if (state === "loading") return <CourseSkeleton />;
  if (state === "error")
    return (
      <StatePanel
        title="코스를 불러오지 못했습니다."
        action="다시 시도"
        onAction={onRetry}
      />
    );
  return (
    <main className="min-h-dvh bg-white pb-12">
      <nav
        aria-label="코스 상세 작업"
        className="flex h-14 items-center justify-between px-4 pt-2"
      >
        <BackButton />
        {isOwner ? (
          <div className="flex gap-1">
            <Link
              href={`/courses/${courseId}/edit`}
              className="inline-flex min-h-9 items-center rounded-lg px-3 text-12 font-semibold hover:bg-black-100"
            >
              수정
            </Link>
            <Button
              variant="ghost"
              size="small"
              onClick={() => setDeletePending(true)}
              aria-label="코스 삭제"
            >
              삭제
            </Button>
          </div>
        ) : null}
      </nav>
      <header className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Badge>공개 코스</Badge>
          <span className="text-12 text-black-500">어진 님</span>
        </div>
        <h1 className="mt-3 text-24 font-semibold">서울숲 엽서 투어</h1>
        <p className="mt-2 text-14 leading-6 text-black-600">
          달콤한 핑크빛 영감으로 가득한 서울숲 체리픽 코스입니다.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <dl className="flex items-center gap-4">
            <div>
              <dt className="text-10 text-black-400">거리</dt>
              <dd className="text-16 font-bold">1.5km</dd>
            </div>
            <div className="h-8 w-px bg-black-100" />
            <div>
              <dt className="text-10 text-black-400">소요시간</dt>
              <dd className="text-16 font-bold">30분</dd>
            </div>
          </dl>
          <span className="text-14 font-semibold text-green-700">
            서울숲 · 성수
          </span>
        </div>
      </header>
      <CourseMap shops={shops} />
      <section className="px-6 py-7">
        <h2 className="text-18 font-semibold">코스 상세 경로</h2>
        {shops.length === 0 ? (
          <StatePanel title="아직 코스에 담긴 상점이 없습니다." />
        ) : (
          <CourseTimeline shops={shops} />
        )}
      </section>
      {deletePending ? (
        <section role="alert" className="mx-6 rounded-2xl bg-pink-100 p-5">
          <p className="font-semibold">이 코스를 삭제하시겠어요?</p>
          <p className="mt-1 text-12 text-black-600">
            삭제한 코스는 다시 복구할 수 없습니다.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setDeletePending(false)}>
              취소
            </Button>
            <Button onClick={onDelete} aria-label="삭제 확인">
              삭제 확인
            </Button>
          </div>
        </section>
      ) : null}
    </main>
  );
}

/** API 연결 전에도 코스의 상대적인 이동 흐름을 보여줍니다. */
function CourseMap({ shops }: { shops: readonly CourseShop[] }) {
  const mapQuery = encodeURIComponent(
    shops.map((shop) => shop.name).join(" ") || "서울숲",
  );
  return (
    <section
      aria-label="코스 지도"
      className="relative h-72 overflow-hidden bg-green-100"
    >
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(25deg,transparent_45%,white_46%,white_51%,transparent_52%),linear-gradient(155deg,transparent_45%,white_46%,white_51%,transparent_52%)] [background-size:90px_70px]" />
      <div className="absolute left-[18%] top-[28%] h-28 w-[62%] rotate-6 rounded-[50%] border-4 border-dashed border-green-500" />
      {shops.map((shop, index) => (
        <span
          key={shop.id}
          className="absolute grid size-8 place-items-center rounded-full border-4 border-green-100 bg-green-700 text-12 font-bold text-white shadow"
          style={{
            left: `${18 + ((index * 23) % 68)}%`,
            top: `${28 + ((index * 17) % 44)}%`,
          }}
        >
          {index + 1}
        </span>
      ))}
      <a
        href={`https://map.naver.com/p/search/${mapQuery}`}
        target="_blank"
        rel="noreferrer"
        aria-label="네이버지도에서 코스 보기"
        className="absolute bottom-4 right-4 rounded-full bg-white px-4 py-2 text-12 font-semibold shadow"
      >
        네이버지도에서 보기
      </a>
    </section>
  );
}

/** 상점을 방문 순서와 함께 연결된 카드로 표시합니다. */
function CourseTimeline({ shops }: { shops: readonly CourseShop[] }) {
  return (
    <ol className="relative mt-5 space-y-6 before:absolute before:bottom-5 before:left-[11px] before:top-3 before:w-0.5 before:bg-pink-100">
      {shops.map((shop, index) => (
        <li key={shop.id} className="relative pl-11">
          <span className="absolute left-0 top-2 z-10 grid size-6 place-items-center rounded-full border-4 border-pink-100 bg-pink-300 text-10 font-bold text-white">
            {index + 1}
          </span>
          <article className="overflow-hidden rounded-2xl border border-pink-100">
            <div className="relative h-40">
              <Image
                fill
                priority={index === 0}
                src={shop.imageUrl}
                alt={`${shop.name} 매장 이미지`}
                sizes="(max-width: 480px) calc(100vw - 92px), 300px"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between gap-2">
                <h3 className="text-18 font-medium">{shop.name}</h3>
                <Badge variant="pink">#소품</Badge>
              </div>
              <p className="mt-2 text-12 leading-5 text-black-600">
                {shop.description}
              </p>
              <div className="mt-3 flex gap-4">
                <Link
                  href={`/shops/${shop.id}`}
                  aria-label={`${shop.name} 상세보기`}
                  className="text-12 font-semibold text-green-700"
                >
                  상세보기 ›
                </Link>
                <a
                  href={shop.naverMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-12 font-semibold text-green-700"
                >
                  지도보기 ›
                </a>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}

/** 실제 레이아웃 크기를 유지하는 코스 로딩 화면입니다. */
function CourseSkeleton() {
  return (
    <main className="p-6 pt-16">
      <Skeleton label="코스를 불러오는 중" className="h-28 rounded-2xl" />
      <Skeleton announce={false} className="mt-5 h-72 rounded-2xl" />
      <Skeleton announce={false} className="mt-6 h-72 rounded-2xl" />
    </main>
  );
}
/** 빈 상태와 오류 상태에서 다음 행동을 안내합니다. */
function StatePanel({
  title,
  action,
  onAction,
}: Readonly<{ title: string; action?: string; onAction?: () => void }>) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center text-center">
      <p className="text-14 text-black-500">{title}</p>
      {action ? (
        <Button className="mt-4" onClick={onAction}>
          {action}
        </Button>
      ) : null}
    </div>
  );
}
