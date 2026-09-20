import { z } from "zod";

/**
 * MongoDB ObjectId 문자열을 검증합니다.
 */
const objectIdSchema = z
  .string()
  .refine(
    (value) => /^[0-9a-fA-F]{24}$/.test(value),
    "유효한 ObjectId 형식이 아닙니다.",
  );

/**
 * 내 픽 폴더 생성 요청
 */
export const createPickFolderSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(50),

    description: z.string().trim().max(300).nullable().optional(),
  }),
});

/**
 * 내 픽 폴더 수정 요청
 */
export const updatePickFolderSchema = z.object({
  params: z.object({
    folderId: objectIdSchema,
  }),

  body: z
    .object({
      title: z.string().trim().min(1).max(50).optional(),

      description: z.string().trim().max(300).nullable().optional(),
    })
    .refine(
      (body) => body.title !== undefined || body.description !== undefined,
      {
        message: "수정할 값이 하나 이상 필요합니다.",
      },
    ),
});

/**
 * 내 픽 폴더 삭제 요청
 */
export const deletePickFolderSchema = z.object({
  params: z.object({
    folderId: objectIdSchema,
  }),
});

/**
 * 내 픽 폴더 순서 변경 요청
 */
export const updatePickFolderOrderSchema = z.object({
  body: z.object({
    folderIds: z
      .array(objectIdSchema)
      .refine((folderIds) => new Set(folderIds).size === folderIds.length, {
        message: "중복된 폴더 ID가 포함되어 있습니다.",
      }),
  }),
});

/**
 * 특정 상점의 내 픽 폴더 조회 요청
 */
export const getShopPickFoldersSchema = z.object({
  params: z.object({
    shopId: objectIdSchema,
  }),
});

/**
 * 특정 상점의 내 픽 폴더 소속 변경 요청
 *
 * folderIds가 빈 배열이면 모든 폴더에서 제거합니다.
 */
export const updateShopFolderIdsSchema = z.object({
  params: z.object({
    shopId: objectIdSchema,
  }),

  body: z.object({
    folderIds: z
      .array(objectIdSchema)
      .refine((folderIds) => new Set(folderIds).size === folderIds.length, {
        message: "중복된 폴더 ID가 포함되어 있습니다.",
      }),
  }),
});

/**
 * 특정 내 픽 폴더의 상점 목록 조회 요청
 */
export const getPickFolderShopsSchema = z.object({
  params: z.object({
    folderId: objectIdSchema,
  }),

  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

/**
 * 폴더에 상점을 추가하는 요청을 검증합니다.
 */
export const addShopToFolderSchema = z.object({
  params: z.object({
    folderId: objectIdSchema,
  }),

  body: z.object({
    shopId: objectIdSchema,
  }),
});

/**
 * 폴더에서 상점을 제거하는 요청을 검증합니다.
 */
export const removeShopFromFolderSchema = z.object({
  params: z.object({
    folderId: objectIdSchema,
    shopId: objectIdSchema,
  }),
});
