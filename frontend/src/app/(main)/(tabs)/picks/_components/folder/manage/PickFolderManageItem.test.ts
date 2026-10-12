import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteMutation = vi.hoisted(() => ({
  error: null,
  isPending: false,
  mutate: vi.fn(),
}));

vi.mock("@/api/pick-folder/pick-folder.query", () => ({
  useDeletePickFolder: () => deleteMutation,
}));

import { PickFolderManageItem } from "./PickFolderManageItem";

const commonProps = {
  folderId: "folder-1",
  title: "성수 소품샵",
  shopCount: 3,
  canMoveUp: true,
  canMoveDown: true,
  isOrdering: false,
  onMove: vi.fn(),
  onEdit: vi.fn(),
} as const;

/** 지정한 관리 모드의 폴더 행을 정적 HTML로 렌더링합니다. */
function renderItem(mode: "manage" | "reorder") {
  return renderToStaticMarkup(
    createElement(PickFolderManageItem, {
      ...commonProps,
      mode,
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PickFolderManageItem", () => {
  it("기본 관리 모드에서는 수정과 삭제만 표시합니다", () => {
    const html = renderItem("manage");

    expect(html).toContain("수정");
    expect(html).toContain("삭제");
    expect(html).not.toContain("위로 이동");
    expect(html).not.toContain("아래로 이동");
  });

  it("순서 변경 모드에서는 위와 아래 이동만 표시합니다", () => {
    const html = renderItem("reorder");

    expect(html).toContain("위로 이동");
    expect(html).toContain("아래로 이동");
    expect(html).not.toContain("수정");
    expect(html).not.toContain("삭제");
  });
});
