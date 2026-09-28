import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  AddShopToFolderRequest,
  CreatePickFolderRequest,
  UpdatePickFolderOrderRequest,
  UpdatePickFolderRequest,
  UpdateShopFolderIdsRequest,
} from "@sopum-map/shared";

import {
  addShopToFolder,
  createPickFolder,
  deletePickFolder,
  getFolderIdsByShop,
  getPickFolders,
  getShopsByFolder,
  removeShopFromFolder,
  updateFolderIdsByShop,
  updatePickFolder,
  updatePickFolderOrder,
} from "./pick-folder.api";

import { getLikedShops } from "../shops/shop-like.api";

/**
 * Pick Folder 관련 React Query key
 */
export const pickFolderQueryKeys = {
  all: ["pick-folders"] as const,

  lists: () => [...pickFolderQueryKeys.all, "list"] as const,

  list: () => [...pickFolderQueryKeys.lists()] as const,

  details: () => [...pickFolderQueryKeys.all, "detail"] as const,

  shops: (folderId: string) =>
    [...pickFolderQueryKeys.details(), folderId, "shops"] as const,

  shopFolders: (shopId: string) =>
    [...pickFolderQueryKeys.all, "shop", shopId, "folders"] as const,
};

/**
 * 내 픽 폴더 목록
 */
export function usePickFolders() {
  return useQuery({
    queryKey: pickFolderQueryKeys.list(),
    queryFn: getPickFolders,
  });
}

/**
 * 특정 상점이 들어있는 폴더 목록
 */
export function useFolderIdsByShop(shopId?: string) {
  return useQuery({
    queryKey: pickFolderQueryKeys.shopFolders(shopId ?? ""),

    queryFn: () => {
      if (!shopId) {
        throw new Error("shopId가 필요합니다.");
      }

      return getFolderIdsByShop(shopId);
    },

    enabled: Boolean(shopId),
  });
}

/**
 * 특정 폴더의 상점 목록
 */
export function useInfiniteShopsByFolder(folderId?: string, limit = 10) {
  return useInfiniteQuery({
    queryKey: pickFolderQueryKeys.shops(folderId ?? ""),

    queryFn: ({ pageParam }) => {
      if (!folderId) {
        throw new Error("folderId가 필요합니다.");
      }

      return getShopsByFolder({
        folderId,
        page: pageParam,
        limit,
      });
    },

    initialPageParam: 1,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,

    enabled: Boolean(folderId),
  });
}

/**
 * 새 폴더 생성
 */
export function useCreatePickFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePickFolderRequest) => createPickFolder(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.list(),
      });
    },
  });
}

/**
 * 폴더 수정
 */
export function useUpdatePickFolder(folderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePickFolderRequest) =>
      updatePickFolder(folderId, input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.list(),
      });
    },
  });
}

/**
 * 폴더 삭제
 */
export function useDeletePickFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => deletePickFolder(folderId),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.all,
      });
    },
  });
}

/**
 * 폴더 순서 변경
 */
export function useUpdatePickFolderOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePickFolderOrderRequest) =>
      updatePickFolderOrder(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.list(),
      });
    },
  });
}

/**
 * 특정 상점의 폴더 상태 일괄 변경
 */
export function useUpdateFolderIdsByShop(shopId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateShopFolderIdsRequest) =>
      updateFolderIdsByShop(shopId, input),

    onSuccess: (data) => {
      queryClient.setQueryData(pickFolderQueryKeys.shopFolders(shopId), data);

      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.list(),
      });

      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.details(),
      });
    },
  });
}

/**
 * 특정 폴더에 상점 추가
 */
export function useAddShopToFolder(folderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddShopToFolderRequest) =>
      addShopToFolder(folderId, input),

    onSuccess: (_, input) => {
      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.shops(folderId),
      });

      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.shopFolders(input.shopId),
      });

      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.list(),
      });
    },
  });
}

/**
 * 특정 폴더에서 상점 제거
 */
export function useRemoveShopFromFolder(folderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shopId: string) => removeShopFromFolder(folderId, shopId),

    onSuccess: (_, shopId) => {
      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.shops(folderId),
      });

      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.shopFolders(shopId),
      });

      void queryClient.invalidateQueries({
        queryKey: pickFolderQueryKeys.list(),
      });
    },
  });
}

export const likedShopQueryKeys = {
  all: ["liked-shops"] as const,

  lists: () => [...likedShopQueryKeys.all, "list"] as const,

  list: () => [...likedShopQueryKeys.lists()] as const,
};

export function useInfiniteLikedShops(limit = 10) {
  return useInfiniteQuery({
    queryKey: likedShopQueryKeys.list(),

    queryFn: ({ pageParam }) =>
      getLikedShops({
        page: pageParam,
        limit,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  });
}
