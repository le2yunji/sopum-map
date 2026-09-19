export type PickFolder = Readonly<{
  id: string;
  title: string;
  description: string | null;
  order: number;
}>;

export type PickFolderListItem = PickFolder &
  Readonly<{
    shopCount: number;
  }>;

export type PickFolderListData = Readonly<{
  items: PickFolderListItem[];
}>;

export type CreatePickFolderRequest = Readonly<{
  title: string;
  description?: string | null;
}>;

export type UpdatePickFolderRequest = Readonly<{
  title?: string;
  description?: string | null;
}>;

export type UpdatePickFolderOrderRequest = Readonly<{
  folderIds: string[];
}>;

/**
 * 특정 상점이 현재 포함된 폴더 목록
 */
export type ShopPickFolderData = Readonly<{
  folderIds: string[];
}>;

/**
 * 특정 상점의 폴더 구성을 한 번에 변경
 */
export type UpdateShopPickFoldersRequest = Readonly<{
  folderIds: string[];
}>;
