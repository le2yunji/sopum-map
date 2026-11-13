import { Schema, model, type InferSchemaType } from "mongoose";
import { MAX_HOME_COURSE_CANDIDATES } from "../constants/course-home.constants.js";

const courseHomeRecommendationSchema = new Schema(
  {
    // 한국 날짜를 YYYY-MM-DD 형식으로 저장
    dateKey: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    // 해당 날짜에 사용할 순서가 고정된 추천 후보
    candidateCourseIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
      ],
      default: [],
      required: true,

      validate: [
        {
          validator(value: unknown[]) {
            return value.length <= MAX_HOME_COURSE_CANDIDATES;
          },
          message: "홈 코스 추천 후보는 최대 20개까지 저장할 수 있습니다.",
        },
        {
          validator(value: Array<{ toString(): string }>) {
            const courseIds = value.map((courseId) => courseId.toString());

            return new Set(courseIds).size === courseIds.length;
          },
          message: "동일한 코스를 홈 추천 후보에 중복 저장할 수 없습니다.",
        },
      ],
    },

    // 이 시각이 지나면 MongoDB TTL 인덱스가 문서를 정리
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 같은 한국 날짜에는 하나의 추천 스냅샷만 저장합니다.
courseHomeRecommendationSchema.index(
  {
    dateKey: 1,
  },
  {
    unique: true,
  },
);

// 만료된 추천 스냅샷은 MongoDB가 자동으로 정리합니다.
courseHomeRecommendationSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

export type CourseHomeRecommendationSchemaType = InferSchemaType<
  typeof courseHomeRecommendationSchema
>;

const CourseHomeRecommendationModel = model(
  "CourseHomeRecommendation",
  courseHomeRecommendationSchema,
);

export default CourseHomeRecommendationModel;
