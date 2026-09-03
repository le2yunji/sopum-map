import { Schema, model, type InferSchemaType } from "mongoose";

import { AUTH_PROVIDERS } from "@sopum-map/shared";

const authIdentitySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: String,
      enum: AUTH_PROVIDERS,
      required: true,
    },

    providerUserId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// 동일한 소셜 계정이 여러 사용자에게 연결되는 것을 방지
authIdentitySchema.index(
  {
    provider: 1,
    providerUserId: 1,
  },
  {
    unique: true,
  },
);

export type AuthIdentitySchemaType = InferSchemaType<typeof authIdentitySchema>;

const AuthIdentityModel = model("AuthIdentity", authIdentitySchema);

export default AuthIdentityModel;
