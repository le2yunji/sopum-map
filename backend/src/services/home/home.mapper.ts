import type { HomeCuratedShop } from "@sopum-map/shared";
import type { Types } from "mongoose";
import type { HomeShopCurationSchemaType } from "../../models/home-shop-curation.model";
import type { ShopSchemaType } from "../../models/shop.model";
import { getMainShopImageUrl } from "../../utils/shop-image";

type HomeCurationItem = HomeShopCurationSchemaType["items"][number];

type HomeShopSource = Pick<
  ShopSchemaType,
  "name" | "description" | "images" | "tagStats" | "regionGroup"
> & {
  _id: Types.ObjectId;
};

/**
 * HomeShopCuration과 Shop 데이터를
 * 홈 API 응답용 데이터로 조합한다.
 */
export const buildHomeCuratedShops = (
  items: HomeCurationItem[],
  shops: HomeShopSource[],
): HomeCuratedShop[] => {
  const shopsById = new Map(shops.map((shop) => [shop._id.toString(), shop]));

  return [...items]
    .sort((first, second) => first.order - second.order)
    .flatMap((item) => {
      const shop = shopsById.get(item.shopId.toString());

      /**
       * 상점이 삭제됐거나 비노출 상태라
       * Service 조회 결과에 없다면 홈에서도 제외한다.
       */
      if (!shop) {
        return [];
      }

      return [
        {
          shopId: shop._id.toString(),
          name: shop.name,
          regionGroup: shop.regionGroup,

          mainImageUrl: getMainShopImageUrl(shop.images),

          tags: shop.tagStats.map(({ key, count }) => ({
            key,
            count,
          })),

          description: shop.description ?? null,

          curatorText: item.curatorText ?? null,
        },
      ];
    });
};
