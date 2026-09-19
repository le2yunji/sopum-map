import { Schema, model, type InferSchemaType } from "mongoose";

const visitLogSchema = new Schema(
  {
    // 방문 기록 작성자
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 방문한 매장
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    // 실제 매장을 방문한 날짜와 시간
    visitedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // 방문 후 작성한 기록
    content: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },

    // 방문 기록에 첨부한 이미지
    imageUrls: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// 사용자별 방문 기록을 방문일 최신순으로 조회
visitLogSchema.index({
  userId: 1,
  visitedAt: -1,
});

// 매장별 방문 기록을 방문일 최신순으로 조회
visitLogSchema.index({
  shopId: 1,
  visitedAt: -1,
});

export type VisitLogSchemaType = InferSchemaType<typeof visitLogSchema>;

const VisitLogModel = model("VisitLog", visitLogSchema);

export default VisitLogModel;
