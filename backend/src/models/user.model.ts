// models/user.model
import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    // 간편 로그인 제공자로부터 받은 이메일
    // 사용자의 동의 여부에 따라 제공되지 않을 수 있음
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    nickname: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 10, // 10자 초과 시 validation 에러
      default: "",
    },
    profileImage: {
      type: String, // 프로필 이미지 URL 문자열
      default: null,
    },
    provider: {
      type: String,
      enum: ["kakao", "google", "naver", "apple"],
      default: "local",
      required: true,
    },
    providerId: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean, // true / false 타입
      default: false, // 기본은 삭제되지 않은 상태
    },
  },
  {
    timestamps: true,
  },
);

// 동일한 소셜 계정의 중복 가입 방지
userSchema.index(
  {
    provider: 1,
    providerId: 1,
  },
  {
    unique: true,
  },
);

// 이메일이 존재하는 사용자끼리만 중복 방지
userSchema.index(
  {
    email: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

export type User = InferSchemaType<typeof userSchema>;

const UserModel = model("User", userSchema);

export default UserModel;
