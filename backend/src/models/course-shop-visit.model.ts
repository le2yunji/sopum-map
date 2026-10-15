import { Schema, model, type InferSchemaType } from "mongoose";

const courseShopVisitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
  },
  { timestamps: true },
);

courseShopVisitSchema.index(
  { userId: 1, courseId: 1, shopId: 1 },
  { unique: true },
);

export type CourseShopVisitSchemaType = InferSchemaType<
  typeof courseShopVisitSchema
>;

const CourseShopVisitModel = model("CourseShopVisit", courseShopVisitSchema);

export default CourseShopVisitModel;
