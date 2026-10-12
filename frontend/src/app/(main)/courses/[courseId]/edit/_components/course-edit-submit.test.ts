import { describe, expect, it, vi } from "vitest";

import { saveCourseEdit } from "./course-edit-submit";

const editInput = {
  title: "성수 소품 산책",
  description: "천천히 둘러보는 코스",
  isPublic: false,
  shops: [
    { shopId: "shop-1", order: 1, memo: null },
    { shopId: "shop-2", order: 2, memo: "엽서 보기" },
  ],
} as const;

describe("saveCourseEdit", () => {
  it("내용 수정 뒤 공개 상태가 달라졌으면 공개 설정도 저장합니다", async () => {
    const updateCourse = vi.fn(async () => undefined);
    const updateVisibility = vi.fn(async () => undefined);

    await saveCourseEdit({
      courseId: "course-1",
      previousIsPublic: true,
      input: editInput,
      updateCourse,
      updateVisibility,
    });

    expect(updateCourse).toHaveBeenCalledWith("course-1", {
      title: editInput.title,
      description: editInput.description,
      shops: editInput.shops,
    });
    expect(updateVisibility).toHaveBeenCalledWith("course-1", false);
  });

  it("공개 상태가 같으면 내용만 저장합니다", async () => {
    const updateCourse = vi.fn(async () => undefined);
    const updateVisibility = vi.fn(async () => undefined);

    await saveCourseEdit({
      courseId: "course-1",
      previousIsPublic: false,
      input: editInput,
      updateCourse,
      updateVisibility,
    });

    expect(updateCourse).toHaveBeenCalledOnce();
    expect(updateVisibility).not.toHaveBeenCalled();
  });

  it("내용 저장에 실패하면 공개 상태는 변경하지 않습니다", async () => {
    const updateCourse = vi.fn(async () => {
      throw new Error("내용 저장 실패");
    });
    const updateVisibility = vi.fn(async () => undefined);

    await expect(
      saveCourseEdit({
        courseId: "course-1",
        previousIsPublic: true,
        input: editInput,
        updateCourse,
        updateVisibility,
      }),
    ).rejects.toThrow("내용 저장 실패");

    expect(updateVisibility).not.toHaveBeenCalled();
  });
});
