"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { MapUserLocation } from "../_types/map.types";

const GEOLOCATION_ERROR_CODE = {
  permissionDenied: 1,
  positionUnavailable: 2,
  timeout: 3,
} as const;

const CURRENT_LOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 30_000,
};

/** 브라우저 위치 오류를 사용자가 이해할 수 있는 안내로 바꿉니다. */
function getLocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case GEOLOCATION_ERROR_CODE.permissionDenied:
      return "현재 위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해 주세요.";

    case GEOLOCATION_ERROR_CODE.positionUnavailable:
      return "현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.";

    case GEOLOCATION_ERROR_CODE.timeout:
      return "현재 위치 확인 시간이 초과되었습니다. 다시 시도해 주세요.";

    default:
      return "현재 위치를 확인하지 못했습니다.";
  }
}

/** 지도 이동에 사용할 현재 위치를 필요할 때 한 번만 요청합니다. */
export function useCurrentMapLocation() {
  const [location, setLocation] = useState<MapUserLocation>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isLocating, setIsLocating] = useState(false);

  const requestInFlightRef = useRef(false); // 빠른 연속 클릭으로 위치 요청이 중복되는 것을 차단
  const isMountedRef = useRef(true); // 위치 응답이 늦게 왔을 때 사라진 화면의 상태 변경을 차단

  /** 위치 요청이 끝난 뒤 언마운트된 화면의 상태를 바꾸지 않게 합니다. */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /** 중복 요청을 막고 브라우저에서 현재 위치를 한 번 확인합니다. */
  const requestCurrentLocation = useCallback(() => {
    if (requestInFlightRef.current) {
      return;
    }

    if (!navigator.geolocation) {
      setErrorMessage("이 브라우저에서는 현재 위치 기능을 사용할 수 없습니다.");
      return;
    }

    requestInFlightRef.current = true;
    setIsLocating(true);
    setErrorMessage(undefined);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        requestInFlightRef.current = false;

        if (!isMountedRef.current) {
          return;
        }

        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        });
        setIsLocating(false);
      },
      (error) => {
        requestInFlightRef.current = false;

        if (!isMountedRef.current) {
          return;
        }

        setErrorMessage(getLocationErrorMessage(error));
        setIsLocating(false);
      },
      CURRENT_LOCATION_OPTIONS,
    );
  }, []);

  /** 사용자가 확인한 위치 오류 안내를 닫습니다. */
  const dismissLocationError = useCallback(() => {
    setErrorMessage(undefined);
  }, []);

  return {
    location,
    errorMessage,
    isLocating,
    requestCurrentLocation,
    dismissLocationError,
  };
}
