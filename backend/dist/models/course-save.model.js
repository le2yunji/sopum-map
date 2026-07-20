"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const courseSaveSchema = new mongoose_1.Schema({
    // 코스를 저장한 사용자
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // 사용자가 저장한 코스
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
}, {
    timestamps: true,
});
// 같은 사용자가 같은 코스를 중복 저장하지 못하도록 설정
courseSaveSchema.index({
    userId: 1,
    courseId: 1,
}, {
    unique: true,
});
// 사용자가 저장한 코스를 최신 저장순으로 조회
courseSaveSchema.index({
    userId: 1,
    createdAt: -1,
});
// 특정 코스를 저장한 사용자 수 조회
courseSaveSchema.index({
    courseId: 1,
});
const CourseSaveModel = (0, mongoose_1.model)("CourseSave", courseSaveSchema);
exports.default = CourseSaveModel;
