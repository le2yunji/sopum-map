import { Schema, model, type InferSchemaType } from "mongoose";
import { TAG_GROUPS } from "@sopum-map/shared";

const tagSchema = new Schema(
  {
    // 사용자에게 표시되는 태그명
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 30,
    },

    // 태그의 성격을 구분하는 그룹
    group: {
      type: String,
      enum: TAG_GROUPS,
      default: "etc",
      required: true,
    },

    // 사용자에게 태그 선택지를 노출할지 여부
    isActive: {
      type: Boolean,
      default: true,
    },

    // 태그 선택 화면에서 기본으로 표시할 순서
    // 동일 그룹 안에서의 관리용 순서
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

tagSchema.index({
  group: 1,
  isActive: 1,
  displayOrder: 1,
});

export type TagSchemaType = InferSchemaType<typeof tagSchema>;

const TagModel = model("Tag", tagSchema);

export default TagModel;
