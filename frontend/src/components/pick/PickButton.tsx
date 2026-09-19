import { HeartIcon } from "@/components/icons/HeartIcon";
import { Button } from "@/components/ui/Button";

type PickButtonProps = Readonly<{
  isLiked: boolean;
  isPending?: boolean;
  onToggleLike: () => void | Promise<void>;
  className?: string;
}>;

export function PickButton({
  isLiked,
  isPending = false,
  onToggleLike,
  className = "",
}: PickButtonProps) {
  return (
    <Button
      type="button"
      iconOnly
      size="small"
      variant="ghost"
      aria-label={isLiked ? "내 픽에서 제거" : "내 픽에 추가"}
      aria-pressed={isLiked}
      disabled={isPending}
      onClick={() => void onToggleLike()}
      className={[
        "hover:bg-transparent! active:bg-transparent!",
        className,
      ].join(" ")}
    >
      <HeartIcon
        filled={isLiked}
        className={
          isLiked
            ? "size-6! text-red-600 [&_path]:stroke-[2]"
            : "size-6! text-black-300 [&_path]:stroke-[1.5]"
        }
      />
    </Button>
  );
}
