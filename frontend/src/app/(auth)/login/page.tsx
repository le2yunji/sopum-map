import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <section>로그인 페이지</section>;
}
