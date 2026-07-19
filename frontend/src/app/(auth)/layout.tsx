type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh">
      <main>{children}</main>
    </div>
  );
}
