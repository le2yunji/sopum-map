"use client";

import { useDeletePickFolder } from "@/api/pick-folder/pick-folder.query";
import { Button } from "@/components/ui/Button";

type Props = Readonly<{
  folderId: string;
  title: string;
  shopCount: number;
  onEdit: () => void;
}>;

export function PickFolderManageItem({
  folderId,
  title,
  shopCount,
  onEdit,
}: Props) {
  const deleteFolderMutation = useDeletePickFolder();

  const handleDelete = () => {
    if (deleteFolderMutation.isPending) {
      return;
    }

    deleteFolderMutation.mutate(folderId);
  };

  return (
    <div className="rounded-xl border border-black-100 px-3 py-1">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="truncate text-14 font-medium">{title}</div>

          <div className="shrink-0 text-12 text-black-500">{shopCount}</div>
        </div>

        <Button
          variant="ghost"
          size="small"
          onClick={onEdit}
          className="min-h-10 px-2.5"
        >
          수정
        </Button>

        <Button
          variant="ghost"
          size="small"
          isLoading={deleteFolderMutation.isPending}
          onClick={handleDelete}
          className="min-h-10 px-2.5 text-red-600"
        >
          삭제
        </Button>
      </div>
    </div>
  );
}
