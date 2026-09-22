"use client";

import { useEffect, useRef, useState } from "react";

import { AddFolderIcon, AddIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button/Button";

type Props = Readonly<{
  activeFolderId: string | null;
  onCreateCourse: (folderId: string | null) => void;
  onCreateFolder: () => void;
}>;

export function PickFolderActions({
  activeFolderId,
  onCreateCourse,
  onCreateFolder,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuFirstItemRef = useRef<HTMLButtonElement>(null);

  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    menuFirstItemRef.current?.focus();
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const closeMenuAndFocusTrigger = () => {
    closeMenu();
    menuTriggerRef.current?.focus();
  };

  return (
    <div className="fixed bottom-20 right-[max(20px,calc((100vw-480px)/2+20px))] z-20 flex flex-col-reverse items-end gap-3">
      <Button
        ref={menuTriggerRef}
        iconOnly
        variant="outline"
        size="large"
        aria-label={menuOpen ? "폴더 작업 닫기" : "폴더 작업 열기"}
        aria-expanded={menuOpen}
        aria-controls="folder-actions"
        onClick={() => {
          setMenuOpen((current) => !current);
        }}
        className="!border-black-100 !bg-white !text-green-700 shadow-sm"
      >
        {menuOpen ? (
          <span className="text-28 font-light leading-none">×</span>
        ) : (
          <AddIcon />
        )}
      </Button>

      {menuOpen ? (
        <div
          id="folder-actions"
          onKeyDown={(event) => {
            if (event.key !== "Escape") {
              return;
            }

            closeMenuAndFocusTrigger();
          }}
          className="w-56 rounded-2xl bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
        >
          <Button
            ref={menuFirstItemRef}
            variant="ghost"
            size="small"
            fullWidth
            onClick={() => {
              onCreateCourse(activeFolderId);
              closeMenu();
            }}
            className="justify-start !font-normal"
          >
            이 폴더 속 샵으로 코스 만들기
          </Button>

          <Button
            variant="ghost"
            size="small"
            fullWidth
            leftIcon={<AddFolderIcon />}
            onClick={() => {
              closeMenu();
              onCreateFolder();
            }}
            className="justify-start !font-normal"
          >
            새로운 폴더 추가하기
          </Button>
        </div>
      ) : null}
    </div>
  );
}
