import Image from "next/image";
import type { ReactNode } from "react";

import { CameraIcon } from "@/components/icons/CameraIcon";
import { CommentIcon } from "@/components/icons/CommentIcon";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";

export type OnboardingSlideData = Readonly<{
  id: "discover" | "pick" | "course" | "visit";
  title: string;
  description: string;
  visual: ReactNode;
}>;

export const ONBOARDING_SLIDES: readonly OnboardingSlideData[] = [
  {
    id: "discover",
    title: "취향에 맞는 소품샵을 발견해요",
    description:
      "지역과 취향 태그로 나에게 꼭 맞는 소품샵을 찾아보세요.",
    visual: (
      <div className="relative h-56 w-72 overflow-hidden rounded-3xl bg-green-75 min-[390px]:h-64 min-[390px]:w-80">
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-10 size-36 rounded-full bg-cream-100/80"
        />
        <div className="absolute left-5 top-5 rounded-full bg-white px-3 py-2 text-12 font-semibold text-green-800 shadow-sm">
          연남동 · 빈티지
        </div>
        <div
          aria-hidden="true"
          className="absolute right-7 top-12 flex size-12 items-center justify-center rounded-full bg-white text-green-600 shadow-sm"
        >
          <LocationIcon className="size-7" filled />
        </div>
        <div className="absolute bottom-0 left-1/2 h-44 w-44 -translate-x-1/2 min-[390px]:h-48 min-[390px]:w-48">
          <Image
            src="/images/brand/mascot.webp"
            alt="소품샵을 발견한 소품지도 마스코트"
            fill
            loading="eager"
            sizes="192px"
            className="object-contain object-bottom"
          />
        </div>
      </div>
    ),
  },
  {
    id: "pick",
    title: "마음에 드는 곳은 내 픽에 모아요",
    description:
      "다시 가고 싶은 소품샵을 저장하고 한곳에서 모아볼 수 있어요.",
    visual: (
      <div className="relative h-56 w-72 overflow-hidden rounded-3xl bg-cream-100 min-[390px]:h-64 min-[390px]:w-80">
        <div
          aria-hidden="true"
          className="absolute -bottom-12 -left-8 size-40 rounded-full bg-pink-100/80"
        />
        <div className="absolute left-6 top-5 rounded-2xl bg-white px-4 py-3 shadow-sm">
          <p className="text-12 font-medium text-black-500">내 픽</p>
          <p className="mt-1 text-14 font-semibold text-black-900">
            다시 가고 싶은 곳
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute right-7 top-7 flex size-14 rotate-6 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-sm"
        >
          <HeartIcon className="size-8" filled />
        </div>
        <div className="absolute bottom-1 right-6 h-40 w-40 min-[390px]:h-44 min-[390px]:w-44">
          <Image
            src="/images/brand/mascot-v2.webp"
            alt="마음에 드는 곳을 저장한 소품지도 마스코트"
            fill
            loading="eager"
            sizes="176px"
            className="object-contain object-bottom"
          />
        </div>
      </div>
    ),
  },
  {
    id: "course",
    title: "소품샵을 나만의 코스로 이어봐요",
    description:
      "여러 소품샵을 이어 나만의 산책 코스를 만들어보세요.",
    visual: (
      <div className="relative h-56 w-72 overflow-hidden rounded-3xl bg-green-100 min-[390px]:h-64 min-[390px]:w-80">
        <div
          aria-hidden="true"
          className="absolute left-12 top-14 h-28 w-44 -rotate-6 rounded-full border-2 border-dashed border-green-500/70"
        />
        <div
          aria-hidden="true"
          className="absolute left-7 top-7 flex size-11 items-center justify-center rounded-full bg-white text-green-700 shadow-sm"
        >
          <LocationIcon className="size-7" filled />
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-7 right-6 flex size-11 items-center justify-center rounded-full bg-white text-pink-500 shadow-sm"
        >
          <LocationIcon className="size-7" />
        </div>
        <div className="absolute bottom-1 left-1/2 h-40 w-40 -translate-x-1/2 min-[390px]:h-44 min-[390px]:w-44">
          <Image
            src="/images/brand/mascot.webp"
            alt="소품샵 산책 코스를 만든 소품지도 마스코트"
            fill
            loading="eager"
            sizes="176px"
            className="object-contain object-bottom"
          />
        </div>
        <p className="absolute right-5 top-5 rounded-full bg-green-700 px-3 py-1.5 text-12 font-semibold text-white">
          오늘의 소품산책
        </p>
      </div>
    ),
  },
  {
    id: "visit",
    title: "다녀온 추억을 기록해요",
    description:
      "사진과 한 줄 후기로 소품샵에서의 추억을 남겨보세요.",
    visual: (
      <div className="relative h-56 w-72 overflow-hidden rounded-3xl bg-pink-100 min-[390px]:h-64 min-[390px]:w-80">
        <div className="absolute left-5 top-5 w-40 -rotate-3 rounded-2xl bg-white p-3 shadow-sm">
          <div className="h-16 rounded-xl bg-cream-100" aria-hidden="true" />
          <p className="mt-2 text-12 font-medium text-black-800">
            오늘 발견한 행운이에요
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute right-7 top-8 flex size-12 rotate-6 items-center justify-center rounded-2xl bg-green-700 text-white shadow-sm"
        >
          <CameraIcon className="size-7" />
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-7 left-8 flex size-11 -rotate-6 items-center justify-center rounded-full bg-white text-pink-500 shadow-sm"
        >
          <CommentIcon className="size-7" />
        </div>
        <div className="absolute -bottom-1 right-4 h-36 w-36 min-[390px]:h-40 min-[390px]:w-40">
          <Image
            src="/images/brand/mascot-v2.webp"
            alt="소품샵 방문 추억을 기록한 소품지도 마스코트"
            fill
            loading="eager"
            sizes="160px"
            className="object-contain object-bottom"
          />
        </div>
      </div>
    ),
  },
];
