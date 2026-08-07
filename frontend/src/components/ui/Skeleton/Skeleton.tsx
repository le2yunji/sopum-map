type SkeletonProps = Readonly<{
  className?: string;
  label?: string;
  announce?: boolean;
}>;

/** 콘텐츠가 준비될 때까지 크기를 유지하는 접근 가능한 로딩 블록입니다. */
export function Skeleton({
  className = "",
  label = "콘텐츠를 불러오는 중",
  announce = true,
}: SkeletonProps) {
  const block = (
    <div
      aria-hidden="true"
      className={["bg-black-100 motion-safe:animate-pulse", className]
        .filter(Boolean)
        .join(" ")}
    />
  );

  if (!announce) {
    return block;
  }

  return (
    <div role="status" aria-label={label} className="relative">
      {block}
      <span className="sr-only">{label}</span>
    </div>
  );
}
