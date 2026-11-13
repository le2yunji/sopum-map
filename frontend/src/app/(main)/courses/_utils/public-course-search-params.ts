import {
  PUBLIC_COURSE_SORTS,
  SHOP_REGION_GROUPS,
  type GetPublicCoursesQuery,
  type PublicCourseSort,
  type ShopRegionGroup,
} from "@sopum-map/shared";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

export type PublicCourseBrowseQuery = Readonly<
  Omit<GetPublicCoursesQuery, "cursor" | "limit" | "sort"> & {
    sort: PublicCourseSort;
  }
>;

/** 검색 조건을 검사하기 쉬운 배열 형태로 변환합니다. */
function toSearchParamValues(
  value: string | string[] | undefined,
): readonly string[] {
  if (value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

/** 여러 쿼리 값 중 앞에서부터 첫 번째 유효한 값을 찾습니다. */
function findFirstValidValue<T extends string>(
  value: string | string[] | undefined,
  isValid: (candidate: string) => candidate is T,
): T | undefined {
  return toSearchParamValues(value).find(isValid);
}

/** 공개 코스에서 지원하는 정렬 값인지 확인합니다. */
function isPublicCourseSort(value: string): value is PublicCourseSort {
  return PUBLIC_COURSE_SORTS.some((sort) => sort === value);
}

/** 공개 코스에서 지원하는 지역 값인지 확인합니다. */
function isShopRegionGroup(value: string): value is ShopRegionGroup {
  return SHOP_REGION_GROUPS.some((regionGroup) => regionGroup === value);
}

/** URL 검색 조건을 공개 코스 화면에서 사용할 안전한 값으로 변환합니다. */
export function parsePublicCourseSearchParams(
  input: SearchParams,
): PublicCourseBrowseQuery {
  const regionGroup = findFirstValidValue(input.regionGroup, isShopRegionGroup);

  const sort = findFirstValidValue(input.sort, isPublicCourseSort) ?? "latest";

  if (!regionGroup) {
    return { sort };
  }

  return {
    regionGroup,
    sort,
  };
}
