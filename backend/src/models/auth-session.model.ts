import { Schema, model, type InferSchemaType } from "mongoose";

const authSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
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

authSessionSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

export type AuthSessionSchemaType = InferSchemaType<typeof authSessionSchema>;

const AuthSessionModel = model("AuthSession", authSessionSchema);

export default AuthSessionModel;
