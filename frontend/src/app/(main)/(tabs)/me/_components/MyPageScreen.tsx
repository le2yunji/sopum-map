"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";

type Props = Readonly<{ isLoggedIn?: boolean; isEmpty?: boolean; state?: "success" | "loading" | "error"; onRetry?: () => void; onLogout?: () => void }>;
const MENU_ITEMS = [
  { label: "좋아요한 매장", count: 8, href: "/picks?folder=likes", icon: "♥" },
  { label: "내 픽", count: 12, href: "/picks", icon: "♡" },
  { label: "방문 기록", count: 5, href: "/me/visit-logs", icon: "⌖" },
  { label: "내 코스", count: 3, href: "/me/courses", icon: "☆" },
] as const;

/** 프로필과 사용자 활동으로 이동하는 마이페이지 허브를 제공합니다. */
export function MyPageScreen({ isLoggedIn = true, isEmpty = false, state = "success", onRetry = () => window.location.reload(), onLogout = () => undefined }: Props) {
  const [nickname, setNickname] = useState("소품 수집가");
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("/images/profiles/user_default.webp");

  /** 로컬 프로필 이미지 미리보기 URL을 화면 종료 시 해제합니다. */
  useEffect(() => () => {
    if (profileImageUrl.startsWith("blob:")) URL.revokeObjectURL(profileImageUrl);
  }, [profileImageUrl]);

  if (state === "loading") return <MyPageSkeleton />;
  if (state === "error") return <StatePanel title="마이페이지를 불러오지 못했습니다." action="다시 시도" onAction={onRetry} />;
  if (!isLoggedIn) return <StatePanel title="로그인하고 취향 기록을 모아보세요." actionHref="/login" action="로그인" />;

  /** 닉네임을 저장하고 결과를 페이지 안에서 알립니다. */
  const saveProfile = () => {
    const value = draftNickname.trim();
    if (!value) return;
    setNickname(value);
    setEditing(false);
    setSaved(true);
  };

  return <main className="min-h-full bg-white px-4 pb-28 pt-10">
    <h1 className="px-1 text-24 font-semibold">마이페이지</h1>
    <section aria-label="프로필" className="mt-5 rounded-2xl border border-pink-100 bg-green-100/70 p-4">
      {editing ? <form onSubmit={(event) => { event.preventDefault(); saveProfile(); }}><label htmlFor="profile-image" className="mb-3 inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-black-300 bg-white px-3 text-13 font-semibold">프로필 이미지 변경</label><input id="profile-image" type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setProfileImageUrl(URL.createObjectURL(file)); }}/><label htmlFor="nickname" className="block text-13 font-semibold">닉네임</label><input id="nickname" value={draftNickname} onChange={(event) => setDraftNickname(event.target.value)} maxLength={20} className="mt-2 min-h-11 w-full rounded-xl border border-black-300 bg-white px-3 outline-none focus:ring-2 focus:ring-green-500"/><div className="mt-3 flex gap-2"><Button variant="outline" onClick={() => setEditing(false)}>취소</Button><Button type="submit" disabled={!draftNickname.trim()}>저장</Button></div></form> : <div className="flex items-center gap-4"><div className="relative size-16 overflow-hidden rounded-full border-2 border-green-500 bg-white"><Image fill priority sizes="64px" src={profileImageUrl} unoptimized={profileImageUrl.startsWith("blob:")} alt="프로필 이미지" className="object-cover"/></div><div className="min-w-0 flex-1"><p className="truncate text-16 font-bold">{nickname}</p><p className="text-13 text-black-500">소품샵 탐색가</p></div><Button iconOnly variant="ghost" size="small" aria-label="프로필 수정" onClick={() => { setDraftNickname(nickname); setEditing(true); setSaved(false); }}>✎</Button></div>}
    </section>
    {saved ? <p role="status" className="mt-3 rounded-xl bg-green-100 px-4 py-3 text-13 text-green-700">프로필이 저장되었습니다.</p> : null}
    <Link href="/me/preferences" className="mt-4 flex min-h-20 items-center gap-3 rounded-2xl bg-green-500 p-4 text-white focus-visible:ring-2 focus-visible:ring-green-700"><span className="grid size-12 place-items-center rounded-full bg-white/60 text-22">🍀</span><span className="min-w-0 flex-1"><strong className="block text-14">내 취향 분석 보기</strong><small className="text-12">#키치 #가챠 #문구 분석 완료</small></span><span aria-hidden="true">›</span></Link>
    {isEmpty ? <section className="mt-4 rounded-2xl border border-black-300/70 px-5 py-8 text-center"><p className="text-14 text-black-500">아직 모아둔 취향 기록이 없습니다.</p><Link href="/map" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-green-500 px-5 text-14 font-semibold text-white">상점 둘러보기</Link></section> : <nav aria-label="내 활동" className="mt-4 overflow-hidden rounded-2xl border border-black-300/70">{MENU_ITEMS.map((item) => <Link key={item.label} href={item.href} aria-label={`${item.label} ${item.count}개 보기`} className="flex min-h-15 items-center gap-3 border-b border-black-300/70 px-4 last:border-b-0 focus-visible:bg-green-100"><span aria-hidden="true" className="text-20 text-green-500">{item.icon}</span><span className="flex-1 text-14 font-medium">{item.label}</span><span className="rounded-full bg-green-100 px-2.5 py-0.5 text-12 font-bold text-green-700">{item.count}</span><span aria-hidden="true" className="text-green-500">›</span></Link>)}</nav>}
    <nav aria-label="지원 및 계정" className="mt-4 space-y-2"><MenuLink href="/me/suggestions" label="내 제보 목록" icon="⌂"/><MenuLink href="/shops/suggest" label="소품샵 제보하기" icon="♧"/><MenuLink href="/me/settings" label="계정 설정" icon="⚙"/></nav>
    <Button fullWidth variant="outline" className="mt-4 text-black-500" onClick={() => setLogoutPending(true)}>로그아웃</Button>
    {logoutPending ? <section role="alert" className="mt-4 rounded-2xl bg-pink-100 p-5"><p className="font-semibold">로그아웃하시겠어요?</p><p className="mt-1 text-12 text-black-600">저장한 취향 기록은 그대로 유지됩니다.</p><div className="mt-4 flex gap-2"><Button variant="outline" onClick={() => setLogoutPending(false)}>취소</Button><Button aria-label="로그아웃 확인" onClick={onLogout}>로그아웃 확인</Button></div></section> : null}
  </main>;
}

/** 같은 모양의 지원 메뉴 링크를 일관되게 표시합니다. */
function MenuLink({ href, label, icon }: Readonly<{ href: string; label: string; icon: string }>) { return <Link href={href} className="flex min-h-15 items-center gap-3 rounded-2xl border border-green-500/20 px-4"><span aria-hidden="true" className="text-green-500">{icon}</span><span className="flex-1 text-14 font-medium">{label}</span><span aria-hidden="true" className="text-green-500">›</span></Link>; }
/** 마이페이지의 최종 배치를 유지하는 로딩 상태입니다. */
function MyPageSkeleton() { return <main className="p-4 pt-12"><Skeleton label="마이페이지를 불러오는 중" className="h-10 w-32 rounded-xl"/><Skeleton announce={false} className="mt-5 h-24 rounded-2xl"/><Skeleton announce={false} className="mt-4 h-48 rounded-2xl"/></main>; }
/** 로그인 안내와 오류 복구를 같은 화면 밀도로 제공합니다. */
function StatePanel({ title, action, actionHref, onAction }: Readonly<{ title: string; action: string; actionHref?: string; onAction?: () => void }>) { return <main className="grid min-h-[70dvh] place-items-center px-6 text-center"><div><p className="text-16 text-black-600">{title}</p>{actionHref ? <Link href={actionHref} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-green-500 px-5 text-14 font-semibold text-white">{action}</Link> : <Button className="mt-5" onClick={onAction}>{action}</Button>}</div></main>; }
