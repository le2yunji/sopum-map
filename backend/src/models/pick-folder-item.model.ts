import { Schema, model, type InferSchemaType } from "mongoose";

const pickFolderItemSchema = new Schema(
  {
    // 매장이 들어갈 폴더
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "PickFolder",
      required: true,
    },

    // 폴더에 저장된 매장
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

// 동일한 폴더에 같은 매장이 중복 저장되는 것을 방지
pickFolderItemSchema.index(
  {
    folderId: 1,
    shopId: 1,
  },
  {
    unique: true,
  },
);

export type PickFolderItemSchemaType = InferSchemaType<
  typeof pickFolderItemSchema
>;

const PickFolderItemModel = model("PickFolderItem", pickFolderItemSchema);

export default PickFolderItemModel;
