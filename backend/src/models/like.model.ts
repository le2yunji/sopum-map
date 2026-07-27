import { Schema, model, type InferSchemaType } from "mongoose";

const likeSchema = new Schema(
  {
    // 좋아요를 누른 사용자
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 좋아요를 누른 매장
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 동일한 사용자가 같은 매장에 중복 좋아요하는 것을 방지
likeSchema.index(
  {
    userId: 1,
    shopId: 1,
  },
  {
    unique: true,
  },
);

// 사용자별 좋아요 목록 조회 성능 개선
likeSchema.index({
  userId: 1,
  createdAt: -1,
});

export type LikeSchemaType = InferSchemaType<typeof likeSchema>;

const LikeModel = model("Like", likeSchema);

export default LikeModel;
