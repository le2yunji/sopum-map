import { BottomNavigation } from "@/components/navigation/BottomNavigation/BottomNavigation";

type TabsLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function TabsLayout({ children }: TabsLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-20">{children}</main>

      <div className="fixed inset-x-0 bottom-0 z-50">
        <BottomNavigation />
      </div>
    </div>
  );
}
