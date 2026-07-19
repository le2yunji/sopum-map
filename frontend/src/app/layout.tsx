import type { Metadata } from "next";
import "./globals.css";
import { pretendard } from "./font";

export const metadata: Metadata = {
  title: {
    default: "소품지도",
    template: "%s | 소품지도",
  },
  description:
    "취향에 맞는 소품샵, 가챠샵, 굿즈샵을 발견하고 기록하는 지도 서비스",
  applicationName: "소품지도",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <div id="mobile-app">{children}</div>
      </body>
    </html>
  );
}
