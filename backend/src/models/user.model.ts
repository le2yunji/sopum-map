import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    nickname: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 10,
      default: "",
    },

    profileImage: {
      type: String,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export type UserSchemaType = InferSchemaType<typeof userSchema>;

const UserModel = model("User", userSchema);

export default UserModel;
