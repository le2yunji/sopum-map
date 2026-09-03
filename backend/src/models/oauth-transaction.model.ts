import { Schema, model, type InferSchemaType } from "mongoose";

import { AUTH_PROVIDERS } from "@sopum-map/shared";

const oauthTransactionSchema = new Schema(
  {
    provider: {
      type: String,
      enum: AUTH_PROVIDERS,
      required: true,
    },

    stateHash: {
      type: String,
      required: true,
      unique: true,
    },

    nonceHash: {
      type: String,
      required: true,
    },

    returnTo: {
      type: String,
      default: "/",
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

oauthTransactionSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

export type OAuthTransactionSchemaType = InferSchemaType<
  typeof oauthTransactionSchema
>;

const OAuthTransactionModel = model("OAuthTransaction", oauthTransactionSchema);

export default OAuthTransactionModel;
