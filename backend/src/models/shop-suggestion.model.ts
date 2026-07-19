import { Schema, model, type InferSchemaType } from "mongoose";

const shopSuggestionSchema = new Schema(
  {
    // 제보한 사용자
    // 비회원 제보도 받을 경우 필수값으로 두지 않음
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 제보할 매장 이름
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // 제보할 매장 주소
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // 매장 정보를 확인할 수 있는 지도, SNS 등의 링크
    url: {
      type: String,
      default: null,
      trim: true,
    },

    // 제보자가 남긴 추가 설명
    memo: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },

    // 제보 처리 상태
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 상태별 제보 목록 조회 성능 개선
shopSuggestionSchema.index({
  status: 1,
  createdAt: -1,
});

// 사용자별 제보 목록 조회 성능 개선
shopSuggestionSchema.index({
  userId: 1,
  createdAt: -1,
});

export type ShopSuggestion = InferSchemaType<typeof shopSuggestionSchema>;

const ShopSuggestionModel = model("ShopSuggestion", shopSuggestionSchema);

export default ShopSuggestionModel;
