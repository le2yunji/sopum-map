import { Schema, model, type InferSchemaType } from "mongoose";

import {
  SHOP_CATEGORIES,
  SHOP_IMAGE_SOURCE_TYPES,
  SHOP_REGION_GROUPS,
  SHOP_SOURCE_TYPES,
  SHOP_STATUSES,
  SHOP_BUSINESS_DAYS,
  TAG_KEYS,
} from "@sopum-map/shared";

/**
 * 영업 시작 시간
 * 00:00 ~ 23:59
 */
const OPEN_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/**
 * 영업 종료 시간
 *
 * 자정까지 영업하는 경우를 표현하기 위해
 * 24:00까지 허용합니다.
 */
const CLOSE_TIME_PATTERN = /^(?:(?:[01]\d|2[0-3]):[0-5]\d|24:00)$/;

/**
 * 전화번호를 DB 저장 형식으로 정규화합니다.
 *
 * 02-123-1234   -> 021231234
 * 010-1234-5678 -> 01012345678
 */
function normalizePhone(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.replace(/\D/g, "");

  return normalized.length > 0 ? normalized : null;
}

/**
 * http 또는 https 절대 URL인지 확인합니다.
 */
function isHttpUrl(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 이미지 주소는 아래 두 형식을 허용합니다.
 *
 * - 서비스 내부 이미지
 *   /images/profiles/shop_default.webp
 *
 * - 외부 이미지
 *   https://example.com/image.webp
 */
function isImageUrl(value: string) {
  if (value.startsWith("/")) {
    return true;
  }

  return isHttpUrl(value);
}

// -----------------------------------------------------------------------------
// 이미지
// -----------------------------------------------------------------------------

const shopImageSchema = new Schema(
  {
    // 이미지 주소
    imageUrl: {
      type: String,
      required: true,
      trim: true,

      validate: {
        validator: isImageUrl,
        message:
          "imageUrl은 /로 시작하는 내부 경로 또는 http/https URL이어야 합니다.",
      },
    },

    // 이미지 대체 설명
    altText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    // 이미지 원본 출처 페이지
    sourceUrl: {
      type: String,
      default: null,
      trim: true,

      validate: {
        validator: isHttpUrl,
        message: "sourceUrl은 올바른 http/https URL이어야 합니다.",
      },
    },

    // 이미지 출처 유형
    sourceType: {
      type: String,
      enum: SHOP_IMAGE_SOURCE_TYPES,
      default: "official",
      required: true,
    },

    // 대표 이미지 여부
    isMain: {
      type: Boolean,
      default: false,
    },

    // 이미지 노출 순서
    order: {
      type: Number,
      default: 0,
      min: 0,

      validate: {
        validator: Number.isInteger,
        message: "이미지 order는 정수여야 합니다.",
      },
    },
  },
  {
    _id: false,
  },
);

// -----------------------------------------------------------------------------
// 사용자 태그 통계
// -----------------------------------------------------------------------------

const shopTagStatSchema = new Schema(
  {
    // 태그 식별값
    key: {
      type: String,
      enum: TAG_KEYS,
      required: true,
    },

    // 해당 태그가 선택된 횟수
    count: {
      type: Number,
      default: 0,
      min: 0,

      validate: {
        validator: Number.isInteger,
        message: "태그 count는 정수여야 합니다.",
      },
    },
  },
  {
    _id: false,
  },
);

// -----------------------------------------------------------------------------
// 위치
// -----------------------------------------------------------------------------

const geoLocationSchema = new Schema(
  {
    // GeoJSON 타입
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },

    /**
     * GeoJSON 좌표
     *
     * 반드시
     * [경도, 위도]
     *
     * 순서입니다.
     */
    coordinates: {
      type: [Number],
      required: true,

      validate: {
        validator(value: number[]) {
          if (value.length !== 2) {
            return false;
          }

          const [longitude, latitude] = value;

          if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
            return false;
          }

          return (
            longitude >= -180 &&
            longitude <= 180 &&
            latitude >= -90 &&
            latitude <= 90
          );
        },

        message:
          "coordinates는 [경도, 위도] 형식이며 경도는 -180~180, 위도는 -90~90 범위여야 합니다.",
      },
    },
  },
  {
    _id: false,
  },
);

// -----------------------------------------------------------------------------
// 영업시간
// -----------------------------------------------------------------------------

/**
 * 하루 안에서 하나의 영업 구간
 *
 * 예:
 *
 * {
 *   open: "11:00",
 *   close: "14:00"
 * }
 *
 * {
 *   open: "15:00",
 *   close: "20:00"
 * }
 */
const businessPeriodSchema = new Schema(
  {
    open: {
      type: String,
      required: true,
      trim: true,

      validate: {
        validator(value: string) {
          return OPEN_TIME_PATTERN.test(value);
        },

        message: "open은 HH:mm 형식이어야 합니다.",
      },
    },

    close: {
      type: String,
      required: true,
      trim: true,

      validate: {
        validator(value: string) {
          return CLOSE_TIME_PATTERN.test(value);
        },

        message: "close는 HH:mm 형식이어야 합니다.",
      },
    },
  },
  {
    _id: false,
  },
);

/**
 * 요일별 영업시간
 */
const shopBusinessHourSchema = new Schema(
  {
    day: {
      type: String,
      enum: SHOP_BUSINESS_DAYS,
      required: true,
    },

    /**
     * 정기 휴무 여부
     */
    isClosed: {
      type: Boolean,
      default: false,
      required: true,
    },

    /**
     * 하루에 여러 영업 구간을 지원합니다.
     *
     * 예:
     *
     * 11:00 ~ 14:00
     * 15:00 ~ 20:00
     */
    periods: {
      type: [businessPeriodSchema],
      default: [],
    },
  },
  {
    _id: false,
  },
);

// -----------------------------------------------------------------------------
// 매장
// -----------------------------------------------------------------------------

const shopSchema = new Schema(
  {
    // -------------------------------------------------------------------------
    // 외부 데이터
    // -------------------------------------------------------------------------

    // 공공데이터 원본 ID
    publicSourceId: {
      type: String,
      default: null,
      trim: true,
    },

    // -------------------------------------------------------------------------
    // 기본 정보
    // -------------------------------------------------------------------------

    // 매장 이름
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // 매장 유형
    category: {
      type: String,
      enum: SHOP_CATEGORIES,
      required: true,
    },

    // -------------------------------------------------------------------------
    // 사용자 데이터
    // -------------------------------------------------------------------------

    // 사용자 후기에서 집계된 태그
    tagStats: {
      type: [shopTagStatSchema],
      default: [],

      validate: {
        validator(value: Array<{ key: string; count: number }>) {
          const keys = value.map((tag) => tag.key);

          return new Set(keys).size === keys.length;
        },

        message: "동일한 태그를 tagStats에 중복해서 저장할 수 없습니다.",
      },
    },

    // 매장을 좋아요한 사용자 수
    likeCount: {
      type: Number,
      default: 0,
      min: 0,

      validate: {
        validator: Number.isInteger,
        message: "likeCount는 정수여야 합니다.",
      },
    },

    // -------------------------------------------------------------------------
    // 주소
    // -------------------------------------------------------------------------

    // 사용자에게 표시할 전체 주소
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // 시·도
    region1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    // 시·군·구
    region2: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    // 읍·면·동
    region3: {
      type: String,
      default: null,
      trim: true,
      maxlength: 30,
    },

    // 서비스 내부 지역 그룹
    regionGroup: {
      type: String,
      enum: SHOP_REGION_GROUPS,
      required: true,
    },

    // MongoDB 지도 검색용 좌표
    location: {
      type: geoLocationSchema,
      required: true,
    },

    // -------------------------------------------------------------------------
    // 연락처
    // -------------------------------------------------------------------------

    /**
     * 전화번호
     *
     * DB에는 숫자만 저장합니다.
     *
     * 입력:
     * 02-123-1234
     *
     * 저장:
     * 021231234
     *
     * 화면:
     * formatter를 이용해 다시 02-123-1234 형태로 표시합니다.
     */
    phone: {
      type: String,
      default: null,

      set: normalizePhone,

      minlength: 8,
      maxlength: 15,

      validate: {
        validator(value: string | null) {
          if (value === null) {
            return true;
          }

          return /^\d+$/.test(value);
        },

        message: "전화번호는 숫자로만 저장되어야 합니다.",
      },
    },

    // -------------------------------------------------------------------------
    // 매장 설명
    // -------------------------------------------------------------------------

    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    // -------------------------------------------------------------------------
    // 영업시간
    // -------------------------------------------------------------------------

    /**
     * 구조화된 영업시간
     *
     * 영업시간 자체를 모르는 요일은 배열에 넣지 않습니다.
     *
     * 휴무일:
     *
     * {
     *   day: "tuesday",
     *   isClosed: true,
     *   periods: []
     * }
     */
    businessHours: {
      type: [shopBusinessHourSchema],
      default: [],

      validate: [
        {
          // 같은 요일 중복 방지
          validator(
            value: Array<{
              day: string;
              isClosed: boolean;
              periods: unknown[];
            }>,
          ) {
            const days = value.map((businessHour) => businessHour.day);

            return new Set(days).size === days.length;
          },

          message: "businessHours에 동일한 요일을 중복 저장할 수 없습니다.",
        },

        {
          /**
           * 휴무일에는 periods가 없어야 하고,
           * 영업일에는 최소 한 개의 period가 있어야 합니다.
           */
          validator(
            value: Array<{
              day: string;
              isClosed: boolean;
              periods: unknown[];
            }>,
          ) {
            return value.every((businessHour) => {
              if (businessHour.isClosed) {
                return businessHour.periods.length === 0;
              }

              return businessHour.periods.length > 0;
            });
          },

          message:
            "휴무일은 periods가 비어 있어야 하며 영업일은 최소 하나의 영업시간이 필요합니다.",
        },
      ],
    },

    /**
     * 구조화하기 어려운 추가 안내
     *
     * 예:
     *
     * "공휴일 영업시간은 인스타그램을 확인해주세요."
     * "매월 마지막 주 월요일 휴무"
     */
    businessHoursNote: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    // -------------------------------------------------------------------------
    // 외부 링크
    // -------------------------------------------------------------------------

    instagramUrl: {
      type: String,
      default: null,
      trim: true,

      validate: {
        validator: isHttpUrl,
        message: "instagramUrl은 올바른 http/https URL이어야 합니다.",
      },
    },

    // 네이버 플레이스 상세 주소
    naverPlaceUrl: {
      type: String,
      default: null,
      trim: true,

      validate: {
        validator: isHttpUrl,
        message: "naverPlaceUrl은 올바른 http/https URL이어야 합니다.",
      },
    },

    // 네이버 지도 주소
    naverMapUrl: {
      type: String,
      default: null,
      trim: true,

      validate: {
        validator: isHttpUrl,
        message: "naverMapUrl은 올바른 http/https URL이어야 합니다.",
      },
    },

    // -------------------------------------------------------------------------
    // 이미지
    // -------------------------------------------------------------------------

    images: {
      type: [shopImageSchema],
      default: [],

      validate: {
        // 대표 이미지는 최대 한 장만 허용
        validator(value: Array<{ isMain?: boolean }>) {
          return value.filter((image) => image.isMain).length <= 1;
        },

        message: "대표 이미지는 최대 한 장만 저장할 수 있습니다.",
      },
    },

    // -------------------------------------------------------------------------
    // 데이터 출처
    // -------------------------------------------------------------------------

    sourceType: {
      type: String,
      enum: SHOP_SOURCE_TYPES,
      default: "admin",
      required: true,
    },

    // -------------------------------------------------------------------------
    // 운영 상태
    // -------------------------------------------------------------------------

    status: {
      type: String,
      enum: SHOP_STATUSES,
      default: "active",
      required: true,
    },
  },
  {
    // createdAt / updatedAt 자동 생성
    timestamps: true,
  },
);

// -----------------------------------------------------------------------------
// Index
// -----------------------------------------------------------------------------

// 지도 반경 검색
shopSchema.index({
  location: "2dsphere",
});

// 카테고리 + 상태
shopSchema.index({
  status: 1,
  category: 1,
});

// 지역별 조회
shopSchema.index({
  regionGroup: 1,
});

// 매장명 / 주소 / 설명 검색
shopSchema.index({
  name: "text",
  address: "text",
  description: "text",
});

// 운영 중인 매장을 좋아요 순으로 조회
shopSchema.index({
  status: 1,
  likeCount: -1,
});

// -----------------------------------------------------------------------------
// Types / Model
// -----------------------------------------------------------------------------

export type ShopSchemaType = InferSchemaType<typeof shopSchema>;

const ShopModel = model("Shop", shopSchema);

export default ShopModel;
