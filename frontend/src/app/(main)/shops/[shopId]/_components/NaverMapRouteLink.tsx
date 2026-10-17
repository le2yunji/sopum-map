"use client";

import { LocationIcon } from "@/components/icons";

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
      aria-label="길찾기"
      className="inline-flex min-h-11 shrink-0 items-center gap-1 text-12 text-black-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
    >
      <LocationIcon aria-hidden="true" className="size-4" />
      길찾기
    </a>
  );
}
