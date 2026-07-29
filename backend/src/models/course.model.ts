import { COURSE_TYPES } from "@sopum-map/shared";
import { Schema, model, type InferSchemaType } from "mongoose";

const courseShopSchema = new Schema(
  {
    // 코스에 포함된 매장
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    // 코스 내 매장 방문 순서
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    // 해당 매장을 방문할 때 참고할 메모
    memo: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300,
    },
  },
  {
    // 각 매장 요소에 별도 _id를 생성하지 않음
    _id: false,
  },
);

const courseSchema = new Schema(
  {
    // 코스 유형
    courseType: {
      type: String,
      enum: COURSE_TYPES,
      default: "user",
      required: true,
    },

    // 사용자가 만든 코스일 때의 작성자
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required(this: { courseType: string }) {
        return this.courseType === "user";
      },
    },

    // 코스 생성에 사용한 내 픽 폴더
    // 출처 기록용이며 이후 폴더 변경이 코스에 반영되지는 않음
    sourceFolderId: {
      type: Schema.Types.ObjectId,
      ref: "PickFolder",
      default: null,
    },

    // 코스 제목
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // 코스에 대한 설명
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },

    // 코스 대표 지역
    region: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    // 다른 사용자에게 코스를 공개할지 여부
    isPublic: {
      type: Boolean,
      default: false,
    },

    // 코스에 포함된 매장과 방문 순서
    shops: {
      type: [courseShopSchema],
      required: true,
      validate: [
        {
          validator(value: unknown[]) {
            return value.length >= 2;
          },
          message: "코스에는 최소 2개의 매장이 필요합니다.",
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

// 사용자가 만든 코스 목록 조회
courseSchema.index({
  userId: 1,
  createdAt: -1,
});

// 공개된 코스 목록 조회
courseSchema.index({
  isPublic: 1,
  createdAt: -1,
});

// 추천 코스 조회
courseSchema.index({
  courseType: 1,
  createdAt: -1,
});

// 지역별 공개 코스 조회
courseSchema.index({
  region: 1,
  isPublic: 1,
  createdAt: -1,
});

export type CourseSchemaType = InferSchemaType<typeof courseSchema>;

const CourseModel = model("Course", courseSchema);

export default CourseModel;
