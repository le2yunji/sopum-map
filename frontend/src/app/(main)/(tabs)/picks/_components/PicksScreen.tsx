"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BottomSheet } from "@/components/ui/BottomSheet/BottomSheet";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

type PickShop = Readonly<{
  id: string;
  name: string;
  region: string;
  category: string;
  imageUrl: string;
  folders: readonly string[];
  memo?: string;
}>;

const DEFAULT_SHOPS: readonly PickShop[] = [
  { id: "sunny", name: "Sunny 소품샵", region: "성수", category: "소품샵", imageUrl: "/images/shops/shop_example.png", folders: ["좋아요", "가고 싶은 곳"] },
  { id: "happy", name: "해피해피샵", region: "홍대/연남", category: "소품샵", imageUrl: "/images/profiles/shop_default.webp", folders: ["좋아요", "가고 싶은 곳", "선물 사기 좋은 곳"], memo: "주말 오후에 들러보기" },
  { id: "gacha", name: "가챠가챠", region: "홍대/연남", category: "가챠샵", imageUrl: "/images/brand/mascot-v2.webp", folders: ["좋아요", "연남"] },
  { id: "paper", name: "페이퍼가든", region: "망원", category: "문구샵", imageUrl: "/images/brand/mascot.webp", folders: ["좋아요", "가고 싶은 곳"] },
  { id: "mood", name: "무드캐비닛", region: "성수", category: "소품샵", imageUrl: "/images/profiles/user_default.webp", folders: ["좋아요"] },
] as const;

type Props = Readonly<{
  initialShops?: readonly PickShop[];
  state?: "success" | "loading" | "error";
  onRetry?: () => void;
  onCreateCourse?: (folderName: string) => void;
}>;

/** Figma의 폴더 필터형 내 픽 화면을 로컬 상태로 제공합니다. */
export function PicksScreen({
  initialShops = DEFAULT_SHOPS,
  state = "success",
  onRetry = () => window.location.reload(),
  onCreateCourse = () => undefined,
}: Props) {
  const [folders, setFolders] = useState(["좋아요", "가고 싶은 곳", "선물 사기 좋은 곳", "연남"]);
  const [activeFolder, setActiveFolder] = useState("좋아요");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const menuFirstItemRef = useRef<HTMLButtonElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const filteredShops = initialShops.filter((shop) => shop.folders.includes(activeFolder));
  const folderCount = (folder: string) => initialShops.filter((shop) => shop.folders.includes(folder)).length;
  const normalizedFolderName = newFolderName.trim();
  const isDuplicateFolder = folders.includes(normalizedFolderName);

  /** 작업 메뉴가 열리면 키보드 초점을 첫 작업으로 옮깁니다. */
  useEffect(() => {
    if (menuOpen) menuFirstItemRef.current?.focus();
  }, [menuOpen]);

  if (state === "loading") return <PicksSkeleton />;
  if (state === "error") return <StatePanel title="내 픽을 불러오지 못했어요" action="다시 시도" onAction={onRetry} />;

  /** 입력한 이름의 빈 폴더를 필터 목록에 추가합니다. */
  const addFolder = () => {
    const name = normalizedFolderName;
    if (!name || isDuplicateFolder) return;
    setFolders((current) => [...current, name]);
    setActiveFolder(name);
    setNewFolderName("");
    setSheetOpen(false);
  };

  return (
    <section className="min-h-full bg-white px-5 pb-24 pt-16">
      <header className="flex items-end justify-between">
        <div><p className="text-12 text-green-700">픽한 상점</p><h1 className="mt-1 text-24 font-semibold">내 픽</h1></div>
        <span className="rounded-full bg-green-100 px-3 py-1.5 text-14 font-bold text-green-700">🍀 {initialShops.length}개</span>
      </header>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]" role="group" aria-label="내 픽 폴더">
        {folders.map((folder) => <button key={folder} type="button" aria-pressed={activeFolder === folder} onClick={() => setActiveFolder(folder)} className={["min-h-9 shrink-0 rounded-full border px-3 text-12", activeFolder === folder ? "border-black-900 bg-black-900 font-bold text-white" : "border-black-300 text-black-700"].join(" ")}>{folder} {folderCount(folder)}</button>)}
      </div>

      {filteredShops.length === 0 ? <StatePanel title="아직 이 폴더에 담긴 상점이 없어요" /> : <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-5">{filteredShops.map((shop) => <article key={shop.id} className="min-w-0"><Link href={`/shops/${shop.id}`} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"><div className="relative aspect-square overflow-hidden rounded-2xl bg-black-100"><Image fill src={shop.imageUrl} alt={`${shop.name} 매장 이미지`} sizes="(max-width: 480px) calc((100vw - 52px) / 2), 214px" className="object-cover transition-transform group-hover:scale-[1.02]" /></div><h2 className="mt-3 truncate text-15 font-medium">{shop.name}</h2><div className="mt-1 flex items-center gap-2 text-12"><span className="truncate text-black-500">{shop.region}</span><span className="rounded-full bg-green-100 px-2 py-0.5 text-black-600">{shop.category}</span></div>{shop.memo && activeFolder !== "좋아요" ? <p className="mt-2 line-clamp-2 text-12 text-black-500">메모 · {shop.memo}</p> : null}</Link></article>)}</div>}

      <div className="fixed bottom-20 right-[max(20px,calc((100vw-480px)/2+20px))] z-20 flex flex-col-reverse items-end gap-3">
        <button ref={menuTriggerRef} type="button" aria-label={menuOpen ? "폴더 작업 닫기" : "폴더 작업 열기"} aria-expanded={menuOpen} aria-controls="folder-actions" onClick={() => setMenuOpen(!menuOpen)} className="grid size-13 place-items-center rounded-full border border-black-100 bg-white text-32 font-light text-green-700 shadow-sm">{menuOpen ? "×" : "+"}</button>
        {menuOpen ? <div id="folder-actions" onKeyDown={(event) => { if (event.key === "Escape") { setMenuOpen(false); menuTriggerRef.current?.focus(); } }} className="w-52 rounded-2xl bg-white p-2 text-13 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"><button ref={menuFirstItemRef} type="button" onClick={() => { onCreateCourse(activeFolder); setMenuOpen(false); }} className="min-h-11 w-full rounded-xl px-3 text-left hover:bg-black-100">이 폴더 속 샵으로 코스 만들기</button><button type="button" onClick={() => { setMenuOpen(false); setSheetOpen(true); }} className="min-h-11 w-full rounded-xl px-3 text-left hover:bg-black-100">새로운 폴더 추가하기</button></div> : null}
      </div>

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} ariaLabelledBy="new-folder-title"><form onSubmit={(event) => { event.preventDefault(); addFolder(); }}><BottomSheet.Handle /><BottomSheet.Header><BottomSheet.Title id="new-folder-title">새 폴더 만들기</BottomSheet.Title></BottomSheet.Header><BottomSheet.Body><label htmlFor="new-folder-name" className="text-14 font-semibold">새 폴더 이름</label><input id="new-folder-name" value={newFolderName} onChange={(event) => setNewFolderName(event.target.value)} maxLength={20} aria-invalid={isDuplicateFolder} aria-describedby={isDuplicateFolder ? "new-folder-error" : undefined} className="mt-2 min-h-12 w-full rounded-xl border border-black-300 px-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />{isDuplicateFolder ? <p id="new-folder-error" className="mt-2 text-12 text-red-600">이미 사용 중인 폴더 이름이에요.</p> : null}</BottomSheet.Body><BottomSheet.Footer><Button type="submit" fullWidth disabled={!normalizedFolderName || isDuplicateFolder}>폴더 만들기</Button></BottomSheet.Footer></form></BottomSheet>
    </section>
  );
}

/** 내 픽 목록의 배치를 유지하는 로딩 상태입니다. */
function PicksSkeleton() { return <section className="p-5 pt-16"><Skeleton label="내 픽을 불러오는 중" className="h-14 w-36 rounded-xl" /><div className="mt-6 grid grid-cols-2 gap-3"><Skeleton announce={false} className="aspect-square rounded-2xl" /><Skeleton announce={false} className="aspect-square rounded-2xl" /></div></section>; }

/** 내 픽의 빈 상태와 오류 상태를 같은 화면 밀도로 안내합니다. */
function StatePanel({ title, action, onAction }: Readonly<{ title: string; action?: string; onAction?: () => void }>) { return <div className="flex min-h-72 flex-col items-center justify-center text-center"><p className="text-14 text-black-500">{title}</p>{action ? <Button className="mt-4" onClick={onAction}>{action}</Button> : null}</div>; }
