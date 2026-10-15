import { describe, expect, it } from "vitest";

import { createApiError } from "@sopum-map/shared";

import {
  canReturnWithBrowserHistory,
  getVisitLogSubmitError,
  parseCourseReturnPath,
} from "./VisitLogCreateScreen";

describe("canReturnWithBrowserHistory", () => {
  it("같은 상점 상세에서 들어온 경우에만 기존 기록을 재사용한다", () => {
    expect(
      canReturnWithBrowserHistory(
        "https://sopum.example/shops/shop-1?tab=logs",
        "https://sopum.example",
        "shop-1",
      ),
    ).toBe(true);
  });

  it.each([
    "",
    "https://outside.example/shops/shop-1",
    "https://sopum.example/shops/shop-2",
    "https://sopum.example/shops/shop-1/visit-logs/new",
  ])(
    "직접 접근하거나 다른 화면에서 온 기록 %s는 재사용하지 않는다",
    (referrer) => {
      expect(
        canReturnWithBrowserHistory(
          referrer,
          "https://sopum.example",
          "shop-1",
        ),
      ).toBe(false);
    },
  );
});

describe("parseCourseReturnPath", () => {
  it("내부 코스 상세 경로만 반환한다", () => {
    expect(parseCourseReturnPath("/courses/6a8a68e15e2aa43be6a6549f")).toBe(
      "/courses/6a8a68e15e2aa43be6a6549f",
    );
  });

  it.each([
    "https://outside.example/courses/course-1",
    "//outside.example/courses/course-1",
    "/courses/course-1/edit",
    "/shops/shop-1",
    "javascript:alert(1)",
  ])("신뢰할 수 없는 복귀 경로 %s를 거부한다", (returnTo) => {
    expect(parseCourseReturnPath(returnTo)).toBeNull();
  });
});

describe("getVisitLogSubmitError", () => {
  it("같은 날짜 중복 오류를 날짜 변경 안내로 바꾼다", () => {
    const error = createApiError({
      status: 409,
      code: "VISIT_LOG_ALREADY_EXISTS",
      message: "duplicate",
    });

    expect(getVisitLogSubmitError(error)).toBe(
      "같은 날짜의 방문 로그가 이미 있어요. 다른 날짜를 선택해 주세요.",
    );
  });
});
