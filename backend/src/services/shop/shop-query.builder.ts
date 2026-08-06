import type { ShopSort } from "@sopum-map/shared";
import type { PipelineStage } from "mongoose";

import type { GetShopsServiceParams } from "./shop.service.types";

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const buildShopMatchFilter = ({
  category,
  keyword,
  region1,
  region2,
  region3,
}: GetShopsServiceParams): Record<string, unknown> => {
  const match: Record<string, unknown> = {
    status: "active",
  };

  if (category) {
    match.category = category;
  }

  if (region1) {
    match.region1 = region1;
  }

  if (region2) {
    match.region2 = region2;
  }

  if (region3) {
    match.region3 = region3;
  }

  if (keyword?.trim()) {
    const keywordRegExp = new RegExp(escapeRegExp(keyword.trim()), "i");

    match.$or = [{ name: keywordRegExp }, { address: keywordRegExp }];
  }

  return match;
};

const buildSortStage = (sort: ShopSort): PipelineStage.Sort => {
  if (sort === "distance") {
    return {
      $sort: {
        distance: 1,
        _id: 1,
      },
    };
  }

  if (sort === "bookmark") {
    return {
      $sort: {
        likeCount: -1,
        createdAt: -1,
        _id: -1,
      },
    };
  }

  return {
    $sort: {
      createdAt: -1,
      _id: -1,
    },
  };
};

export const buildShopListPipeline = (
  params: GetShopsServiceParams,
): PipelineStage[] => {
  const match = buildShopMatchFilter(params);
  const pipeline: PipelineStage[] = [];
  const hasCoordinates = params.lat !== undefined && params.lng !== undefined;

  if (hasCoordinates) {
    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [params.lng!, params.lat!],
        },
        key: "location",
        distanceField: "distance",
        spherical: true,
        query: match,
        ...(params.radius !== undefined
          ? {
              maxDistance: params.radius,
            }
          : {}),
      },
    });
  } else {
    pipeline.push({
      $match: match,
    });
  }

  pipeline.push({
    $facet: {
      items: [
        buildSortStage(params.sort),
        {
          $skip: (params.page - 1) * params.limit,
        },
        {
          $limit: params.limit,
        },
      ],
      metadata: [
        {
          $count: "totalCount",
        },
      ],
    },
  });

  return pipeline;
};
