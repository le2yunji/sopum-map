import { FilterChipGroup } from "@/components/ui/FilterChipGroup/FilterChipGroup";
import type { PickFolderListItem } from "@sopum-map/shared";

import { ALL_PICK_ID } from "../PicksScreen";

type Props = Readonly<{
  folders: readonly PickFolderListItem[];
  activeFolderId: string;
  onChange: (folderId: string) => void;
}>;

export function PickFolderTabs({ folders, activeFolderId, onChange }: Props) {
  const items = [
    {
      label: "전체",
      value: ALL_PICK_ID,
    },

    ...folders.map((folder) => ({
      label: `${folder.title} ${folder.shopCount}`,
      value: folder.id,
    })),
  ];

  return (
    <FilterChipGroup
      items={items}
      selectedValue={activeFolderId}
      ariaLabel="내 픽 폴더"
      onValueChange={onChange}
      className="mt-5 -mr-5 pb-2 pr-5"
    />
  );
}
