"use client";

import { LinkIcon, LocationIcon } from "@/components/icons";

import { useIsMobile } from "@/hooks/useIsMobile";
import {
  createNaverMapPublicRouteUrl,
  createNaverMapWebUrl,
} from "@/utils/naver-map";

type Props = Readonly<{
  name: string;
  latitude: number;
  longitude: number;
  naverPlaceUrl: string | null;
}>;

export function NaverMapRouteLink({
  name,
  latitude,
  longitude,
  naverPlaceUrl,
}: Props) {
  const isMobile = useIsMobile();

  const mobileRouteUrl = createNaverMapPublicRouteUrl({
    name,
    latitude,
    longitude,
  });

  const desktopMapUrl = naverPlaceUrl ?? createNaverMapWebUrl(name);

  const routeUrl = isMobile ? mobileRouteUrl : desktopMapUrl;

  return (
    <a
      href={routeUrl}
      target={isMobile ? undefined : "_blank"}
      rel={isMobile ? undefined : "noopener noreferrer"}
      className="flex min-h-11 items-center justify-between rounded-xl border border-pink-300/30 px-4 text-14"
    >
      <span className="flex items-center gap-2 text-black-600">
        <LocationIcon aria-hidden="true" className="w-5" />
        길찾기
      </span>

      <LinkIcon aria-hidden="true" className="w-5 text-black-600" />
    </a>
  );
}
