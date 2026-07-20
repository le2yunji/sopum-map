"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAG_KEYS = exports.TAG_DEFINITIONS = void 0;
exports.TAG_DEFINITIONS = [
    {
        key: "cute",
        selectionLabel: "아기자기해요",
        shortLabel: "아기자기",
        group: "mood",
    },
    {
        key: "vintage",
        selectionLabel: "빈티지해요",
        shortLabel: "빈티지",
        group: "mood",
    },
    {
        key: "many_stationery",
        selectionLabel: "문구 종류가 다양해요",
        shortLabel: "문구 다양",
        group: "product",
    },
    {
        key: "character",
        selectionLabel: "캐릭터 상품이 다양해요",
        shortLabel: "캐릭터 다양",
        group: "product",
    },
    {
        key: "good_for_gifts",
        selectionLabel: "선물하기 좋아요",
        shortLabel: "선물 추천",
        group: "experience",
    },
    {
        key: "good_for_diary",
        selectionLabel: "다꾸하기 좋아요",
        shortLabel: "다꾸템",
        group: "experience",
    },
];
exports.TAG_KEYS = exports.TAG_DEFINITIONS.map((tag) => tag.key);
