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

  const webUrl = naverPlaceUrl ?? createNaverMapWebUrl(name);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isMobile) {
      return;
    }

    event.preventDefault();

    let appOpened = false;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, {
      once: true,
    });

    window.location.href = mobileRouteUrl;

    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (!appOpened) {
        window.location.href = webUrl;
      }
    }, 1500);
  };
  return (
    <a
      href={isMobile ? mobileRouteUrl : webUrl}
      target={isMobile ? undefined : "_blank"}
      rel={isMobile ? undefined : "noopener noreferrer"}
      onClick={handleClick}
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
