import { Schema, model, type InferSchemaType } from "mongoose";
import {
  TAG_KEYS,
  VISIT_LOG_CONTENT_MAX_LENGTH,
  VISIT_LOG_STATUSES,
  VISIT_LOG_TAG_MAX_COUNT,
} from "@sopum-map/shared";

/** 방문 로그 태그가 필수 개수 범위에 있는지 확인합니다. */
function hasValidTagCount(tagKeys: string[]): boolean {
  return 1 <= tagKeys.length && tagKeys.length <= VISIT_LOG_TAG_MAX_COUNT;
}

/** 한 방문 로그 안에 같은 태그가 중복 저장되지 않게 합니다. */
function hasUniqueTags(tagKeys: string[]): boolean {
  return new Set(tagKeys).size === tagKeys.length;
}

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

    // 같은 한국 달력 날짜의 중복 로그를 막기 위한 서버 계산 키
    visitedDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    // 사용자가 선택한 방문 경험 태그
    selectedTagKeys: {
      type: [
        {
          type: String,
          enum: TAG_KEYS,
        },
      ],
      required: true,
      validate: [
        {
          validator: hasValidTagCount,
          message: `방문 태그는 1개 이상 ${VISIT_LOG_TAG_MAX_COUNT}개 이하로 선택해야 합니다.`,
        },
        {
          validator: hasUniqueTags,
          message: "방문 태그는 중복될 수 없습니다.",
        },
      ],
    },

    // 방문 후 작성한 기록
    content: {
      type: String,
      default: null,
      trim: true,
      maxlength: VISIT_LOG_CONTENT_MAX_LENGTH,
    },

    // 방문 기록에 첨부한 이미지
    imageUrls: {
      type: [String],
      default: [],
    },

    // S3 객체 경로는 이미지 업로드 기능에서 사용
    imageKeys: {
      type: [String],
      default: [],
    },

    // 삭제된 로그는 공개 조회와 집계에서 제외
    status: {
      type: String,
      enum: VISIT_LOG_STATUSES,
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 사용자별 활성 방문 로그를 방문일 최신순으로 조회
visitLogSchema.index({
  userId: 1,
  status: 1,
  visitedAt: -1,
  _id: -1,
});

// 삭제된 기록은 같은 날짜로 다시 작성할 수 있게 활성 로그에만 적용
visitLogSchema.index(
  { userId: 1, shopId: 1, visitedDate: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
  },
);

// 매장별 활성 방문 로그를 방문일 최신순으로 조회
visitLogSchema.index({
  shopId: 1,
  status: 1,
  visitedAt: -1,
  _id: -1,
});

export type VisitLogSchemaType = InferSchemaType<typeof visitLogSchema>;

const VisitLogModel = model("VisitLog", visitLogSchema);

export default VisitLogModel;
