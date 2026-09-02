import type { ShopSort } from "@sopum-map/shared";
import type { PipelineStage } from "mongoose";

import type { GetShopsServiceParams } from "./shop.service.types.js";

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Shop 목록 조회에 사용할 MongoDB 필터 조건을 만든다.
 *
 * Service에서 전달받은:
 *
 * - category
 * - keyword
 * - region1
 * - region2
 * - region3
 *
 * 조건을 MongoDB $match 또는 $geoNear.query에서 사용할
 * 객체 형태로 변환한다.
 */

export const buildShopMatchFilter = ({
  category,
  tagKeys,
  keyword,
  regionGroup,
}: GetShopsServiceParams): Record<string, unknown> => {
  /**
   * 모든 Shop 목록 조회의 기본 조건
   *
   * 사용자에게 노출 가능한
   * active 상태의 매장만 조회한다.
   */
  const match: Record<string, unknown> = {
    status: "active",
  };

  /**
   * category가 전달된 경우
   * 해당 카테고리의 매장만 조회한다.
   */
  if (category) {
    match.category = category;
  }

  /**
   * 태그 필터
   *
   * 여러 태그가 전달되면
   * 선택한 태그 중 하나 이상을 가지고 있는 매장을 조회한다.
   *
   * 예:
   * tagKeys = ["cute", "interior"]
   *
   * → cute 또는 interior 태그가 있는 매장 조회
   */
  if (tagKeys?.length) {
    match["tagStats.key"] = {
      $in: tagKeys,
    };
  }

  if (regionGroup) {
    match.regionGroup = regionGroup;
  }

  /**
   * 검색어가 존재하는 경우
   * 매장명(name) 또는 주소(address)에
   * 검색어가 포함된 Shop을 조회한다.
   *
   * trim()
   * → 검색어 앞뒤 공백 제거
   *
   * escapeRegExp()
   * → 정규식 특수문자를 일반 문자로 처리
   *
   * "i"
   * → 영문 대소문자를 구분하지 않음
   */
  if (keyword?.trim()) {
    const keywordRegExp = new RegExp(escapeRegExp(keyword.trim()), "i");

    match.$or = [{ name: keywordRegExp }, { address: keywordRegExp }];
  }

  return match;
};

const buildSortStage = (sort: ShopSort): PipelineStage.Sort => {
  /**
   * 거리순
   *
   * $geoNear에서 생성된 distance가
   * 작은 Shop부터 조회한다.
   *
   * _id는 distance가 같은 경우
   * 정렬 순서를 안정적으로 유지하기 위한 보조 기준이다.
   */
  if (sort === "distance") {
    return {
      $sort: {
        distance: 1,
        _id: 1,
      },
    };
  }

  /**
   * 인기순
   *
   * 1. likeCount가 높은 순
   * 2. 생성일이 최근인 순
   * 3. _id가 큰 순
   *
   * -1 = 내림차순
   */
  if (sort === "popular") {
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

  if (params.lat !== undefined && params.lng !== undefined) {
    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [params.lng, params.lat],
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

  /**
   * 실제 목록 데이터와
   * 전체 검색 결과 개수를
   * 한 번의 Aggregation에서 동시에 조회한다.
   *
   * $facet은 동일한 조회 결과를
   * 여러 Pipeline으로 나눠 처리할 수 있다.
   */
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
      count: [
        {
          $count: "totalCount",
        },
      ],
    },
  });

  return pipeline;
};
