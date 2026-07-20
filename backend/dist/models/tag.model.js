"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TAG_GROUPS = [
    "mood",
    "product",
    "character",
    "feature",
    "experience",
    "etc",
];
const tagSchema = new mongoose_1.Schema({
    // 사용자에게 표시되는 태그명
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 30,
    },
    // 태그의 성격을 구분하는 그룹
    group: {
        type: String,
        enum: TAG_GROUPS,
        default: "etc",
        required: true,
    },
    // 사용자에게 태그 선택지를 노출할지 여부
    isActive: {
        type: Boolean,
        default: true,
    },
    // 태그 선택 화면에서 기본으로 표시할 순서
    // 동일 그룹 안에서의 관리용 순서
    displayOrder: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});
tagSchema.index({
    group: 1,
    isActive: 1,
    displayOrder: 1,
});
const TagModel = (0, mongoose_1.model)("Tag", tagSchema);
exports.default = TagModel;
