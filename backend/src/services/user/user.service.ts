import {
  createApiError,
  type UpdateMyProfileRequest,
  type UserProfile,
} from "@sopum-map/shared";
import { Types } from "mongoose";

import UserModel from "../../models/user.model.js";
import { isMongoDuplicateKeyError } from "../../utils/mongo-error.js";

/** 사용자의 프로필을 수정합니다. */
export async function updateUserProfile(
  userId: string,
  input: UpdateMyProfileRequest,
): Promise<UserProfile> {
  try {
    const user = await UserModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(userId),
        isDeleted: false,
      },
      {
        $set: input,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      throw createApiError({
        status: 404,
        code: "USER_NOT_FOUND",
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    if (!user.nickname) {
      throw createApiError({
        status: 500,
        code: "INVALID_USER_PROFILE",
        message: "사용자 프로필 정보가 올바르지 않습니다.",
      });
    }

    return {
      id: user._id.toString(),
      nickname: user.nickname,
      profileImage: user.profileImage ?? null,
    };
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      throw createApiError({
        status: 409,
        code: "NICKNAME_ALREADY_EXISTS",
        message: "이미 사용 중인 닉네임입니다.",
      });
    }

    throw error;
  }
}
