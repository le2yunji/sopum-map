"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const COURSE_TYPES = ["user", "recommended"];
const courseShopSchema = new mongoose_1.Schema({
    // 코스에 포함된 매장
    shopId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
    },
    // 코스 내 매장 방문 순서
    order: {
        type: Number,
        required: true,
        min: 1,
    },
    // 해당 매장을 방문할 때 참고할 메모
    memo: {
        type: String,
        default: null,
        trim: true,
        maxlength: 300,
    },
}, {
    // 각 매장 요소에 별도 _id를 생성하지 않음
    _id: false,
});
const courseSchema = new mongoose_1.Schema({
    // 코스 유형
    courseType: {
        type: String,
        enum: COURSE_TYPES,
        default: "user",
        required: true,
    },
    // 사용자가 만든 코스일 때의 작성자
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        required() {
            return this.courseType === "user";
        },
    },
    // 코스 생성에 사용한 내 픽 폴더
    // 출처 기록용이며 이후 폴더 변경이 코스에 반영되지는 않음
    sourceFolderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "PickFolder",
        default: null,
    },
    // 코스 제목
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    // 코스에 대한 설명
    description: {
        type: String,
        default: null,
        trim: true,
        maxlength: 1000,
    },
    // 코스 대표 지역
    region: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    // 다른 사용자에게 코스를 공개할지 여부
    isPublic: {
        type: Boolean,
        default: false,
    },
    // 코스에 포함된 매장과 방문 순서
    shops: {
        type: [courseShopSchema],
        required: true,
        validate: [
            {
                validator(value) {
                    return value.length >= 2;
                },
                message: "코스에는 최소 2개의 매장이 필요합니다.",
            },
        ],
    },
}, {
    timestamps: true,
});
// 사용자가 만든 코스 목록 조회
courseSchema.index({
    userId: 1,
    createdAt: -1,
});
// 공개된 코스 목록 조회
courseSchema.index({
    isPublic: 1,
    createdAt: -1,
});
// 추천 코스 조회
courseSchema.index({
    courseType: 1,
    createdAt: -1,
});
// 지역별 공개 코스 조회
courseSchema.index({
    region: 1,
    isPublic: 1,
    createdAt: -1,
});
const CourseModel = (0, mongoose_1.model)("Course", courseSchema);
exports.default = CourseModel;
