"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const pickFolderSchema = new mongoose_1.Schema({
    // 폴더를 만든 사용자
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // 폴더 이름
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    // 폴더에 대한 간단한 설명
    description: {
        type: String,
        default: null,
        trim: true,
        maxlength: 300,
    },
    // 사용자의 폴더 목록 내 노출 순서
    order: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});
// 사용자별 폴더 목록 조회 성능 개선
pickFolderSchema.index({
    userId: 1,
    order: 1,
});
// 같은 사용자가 동일한 이름의 폴더를 중복 생성하지 못하도록 설정
pickFolderSchema.index({
    userId: 1,
    title: 1,
}, {
    unique: true,
});
const PickFolderModel = (0, mongoose_1.model)("PickFolder", pickFolderSchema);
exports.default = PickFolderModel;
