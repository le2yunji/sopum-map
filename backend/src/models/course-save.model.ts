import { Schema, model, type InferSchemaType } from "mongoose";

const courseSaveSchema = new Schema(
  {
    // 코스를 저장한 사용자
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 사용자가 저장한 코스
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

// 같은 사용자가 같은 코스를 중복 저장하지 못하도록 설정
courseSaveSchema.index(
  {
    userId: 1,
    courseId: 1,
  },
  {
    unique: true,
  },
);

// 사용자가 저장한 코스를 최신 저장순으로 조회
courseSaveSchema.index({
  userId: 1,
  createdAt: -1,
});

// 특정 코스를 저장한 사용자 수 조회
courseSaveSchema.index({
  courseId: 1,
});

export type CourseSave = InferSchemaType<typeof courseSaveSchema>;

const CourseSaveModel = model("CourseSave", courseSaveSchema);

export default CourseSaveModel;
