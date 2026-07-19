import Link from "next/link";

type TabsLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function TabsLayout({ children }: TabsLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">{children}</main>

      <nav
        aria-label="주요 메뉴"
        className="safe-area-bottom sticky bottom-0 z-50 bg-white"
      >
        <Link href="/map">지도</Link>
        <Link href="/picks">내 픽</Link>
        <Link href="/me">마이</Link>
      </nav>
    </div>
  );
}
