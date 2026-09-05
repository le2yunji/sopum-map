"use client";

import { useEffect, useState } from "react";

/** 값 변경이 멈춘 뒤 지정된 시간이 지나면 최신 값을 반환합니다. */
export function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [value, delay]);

  return debouncedValue;
}
