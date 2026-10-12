import { describe, expect, it } from "vitest";
import { createApiError } from "@sopum-map/shared";

import {
  getCourseRegionDestination,
  getPickFolderErrorMessage,
  moveFolderId,
} from "./picks-ui";

describe("getCourseRegionDestination", () => {
  it("선택 가능한 지역이 하나면 생성 화면을 반환합니다", () => {
    expect(
      getCourseRegionDestination("folder-1", [
        {
          regionGroup: "seongsu-seoulforest",
          shopCount: 2,
          availableShopCount: 2,
          temporarilyClosedShopCount: 0,
          courseId: null,
        },
      ]),
    ).toBe("/courses/new?folderId=folder-1&regionGroup=seongsu-seoulforest");
  });

  it("기존 코스 하나만 선택 가능하면 수정 화면을 반환합니다", () => {
    expect(
      getCourseRegionDestination("folder-1", [
        {
          regionGroup: "hongdae-yeonnam",
          shopCount: 0,
          availableShopCount: 0,
          temporarilyClosedShopCount: 0,
          courseId: "course-1",
        },
      ]),
    ).toBe("/courses/course-1/edit");
  });

  it("선택 가능한 지역이 여러 개면 null을 반환합니다", () => {
    expect(
      getCourseRegionDestination("folder-1", [
        {
          regionGroup: "seongsu-seoulforest",
          shopCount: 2,
          availableShopCount: 2,
          temporarilyClosedShopCount: 0,
          courseId: null,
        },
        {
          regionGroup: "hongdae-yeonnam",
          shopCount: 2,
          availableShopCount: 2,
          temporarilyClosedShopCount: 0,
          courseId: null,
        },
      ]),
    ).toBeNull();
  });
});

describe("moveFolderId", () => {
  it("선택한 폴더를 위로 한 칸 이동합니다", () => {
    expect(moveFolderId(["a", "b", "c"], "b", -1)).toEqual(["b", "a", "c"]);
  });

  it("첫 폴더는 위로 이동하지 않습니다", () => {
    expect(moveFolderId(["a", "b"], "a", -1)).toEqual(["a", "b"]);
  });
});

describe("getPickFolderErrorMessage", () => {
  it.each([
    [401, "로그인이 만료되었습니다. 다시 로그인해주세요."],
    [403, "이 폴더를 변경할 권한이 없습니다."],
    [404, "폴더 또는 상점을 찾을 수 없습니다."],
    [409, "현재 상태에서는 요청을 처리할 수 없습니다."],
  ])("%i 오류에 맞는 안내를 반환합니다", (status, message) => {
    expect(
      getPickFolderErrorMessage(
        createApiError({ status, code: "TEST", message: "server" }),
      ),
    ).toBe(message);
  });
});
