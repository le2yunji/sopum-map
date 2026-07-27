import { Schema, model, type InferSchemaType } from "mongoose";

const pickFolderSchema = new Schema(
  {
    // 폴더를 만든 사용자
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 폴더 이름
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    // 폴더에 대한 간단한 설명
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300,
    },
    // 사용자의 폴더 목록 내 노출 순서
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// 사용자별 폴더 목록 조회 성능 개선
pickFolderSchema.index({
  userId: 1,
  order: 1,
});

// 같은 사용자가 동일한 이름의 폴더를 중복 생성하지 못하도록 설정
pickFolderSchema.index(
  {
    userId: 1,
    title: 1,
  },
  {
    unique: true,
  },
);

export type PickFolderSchemaType = InferSchemaType<typeof pickFolderSchema>;

const PickFolderModel = model("PickFolder", pickFolderSchema);

export default PickFolderModel;
