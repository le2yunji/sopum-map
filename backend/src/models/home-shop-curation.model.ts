import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * 오늘의 소품샵 개별 큐레이션 항목
 */
const homeShopCurationItemSchema = new Schema(
  {
    /**
     * 실제 Shop 문서를 참조한다.
     *
     * 상점명, 이미지, 태그, 설명 등은 중복 저장하지 않는다.
     */
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    /**
     * 관리자가 큐레이션 선정 시 작성하는 한 줄 소개.
     */
    curatorText: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },

    /**
     * 홈 슬라이드 노출 순서.
     *
     * 0부터 시작한다.
     */
    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

/**
 * 특정 기간 동안 홈에 노출할 상점 큐레이션 묶음.
 */
const homeShopCurationSchema = new Schema(
  {
    /**
     * 노출 시작 시각
     */
    startAt: {
      type: Date,
      required: true,
    },

    /**
     * 노출 종료 시각
     *
     * 조회 규칙:
     * startAt <= now < endAt
     */
    endAt: {
      type: Date,
      required: true,
    },

    /**
     * 해당 기간 동안 홈에 노출할 상점들.
     *
     * 현재 UI는 3개를 노출하지만
     * 데이터 모델에서는 최대 개수를 제한하지 않는다.
     */
    items: {
      type: [homeShopCurationItemSchema],
      required: true,

      validate: [
        {
          validator(
            value: Array<{
              shopId: unknown;
            }>,
          ) {
            return value.length >= 1;
          },

          message: "HomeShopCuration에는 최소 1개의 상점이 필요합니다.",
        },

        {
          validator(
            value: Array<{
              shopId: { toString(): string };
            }>,
          ) {
            const shopIds = value.map((item) => item.shopId.toString());

            return new Set(shopIds).size === shopIds.length;
          },

          message: "동일한 상점을 HomeShopCuration에 중복 등록할 수 없습니다.",
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

/**
 * 현재 활성 큐레이션 조회를 위한 인덱스.
 */
homeShopCurationSchema.index({
  startAt: -1,
  endAt: 1,
});

export type HomeShopCurationSchemaType = InferSchemaType<
  typeof homeShopCurationSchema
>;

const HomeShopCurationModel = model("HomeShopCuration", homeShopCurationSchema);

export default HomeShopCurationModel;
