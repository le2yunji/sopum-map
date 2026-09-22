import Link from "next/link";
import { Button } from "@/components/ui/Button/Button";

type StatePanelProps = Readonly<{
  title: string;
  action: string;
  actionHref?: string;
  onAction?: () => void;
}>;

export function StatePanel({
  title,
  action,
  actionHref,
  onAction,
}: StatePanelProps) {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-6 text-center">
      <div>
        <p className="text-16 text-black-500">{title}</p>

        {actionHref ? (
          <Link
            href={actionHref}
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-green-500 px-5 text-14 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            {action}
          </Link>
        ) : (
          <Button className="mt-5" onClick={onAction}>
            {action}
          </Button>
        )}
      </div>
    </main>
  );
}
