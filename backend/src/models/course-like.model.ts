import { Schema, model, type InferSchemaType } from "mongoose";

const courseLikeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 같은 사용자는 한 코스를 한 번만 좋아요할 수 있음
courseLikeSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// 사용자의 찜 목록을 좋아요한 최신 순서로 조회
courseLikeSchema.index({ userId: 1, createdAt: -1, _id: -1 });

// 코스가 받은 좋아요 수 조회와 코스 삭제 시 정리
courseLikeSchema.index({ courseId: 1 });

export type CourseLikeSchemaType = InferSchemaType<typeof courseLikeSchema>;

const CourseLikeModel = model("CourseLike", courseLikeSchema);

export default CourseLikeModel;
