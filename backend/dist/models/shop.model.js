"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const shop_constants_js_1 = require("../constants/shop.constants.js");
// 매장 이미지 정보
const shopImageSchema = new mongoose_1.Schema({
    // 이미지 주소
    imageUrl: {
        type: String,
        required: true,
        trim: true,
    },
    // 이미지가 표시되지 않을 때 사용할 대체 설명
    altText: {
        type: String,
        default: "",
        trim: true,
        maxlength: 200,
    },
    // 이미지 출처 페이지 주소
    sourceUrl: {
        type: String,
        default: null,
        trim: true,
    },
    // 이미지 출처 유형
    sourceType: {
        type: String,
        enum: ["official", "user", "admin", "public_data", "etc"],
        default: "official",
        required: true,
    },
    // 대표 이미지 여부
    isMain: {
        type: Boolean,
        default: false,
    },
    // 이미지 노출 순서
    order: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    // 이미지 객체 내부에 별도 _id를 생성하지 않음
    _id: false,
});
// MongoDB 위치 검색을 위한 GeoJSON 구조
const geoLocationSchema = new mongoose_1.Schema({
    // GeoJSON 위치 타입
    type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
    },
    // [경도, 위도] 순서
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator(value) {
                if (value.length !== 2) {
                    return false;
                }
                const [longitude, latitude] = value;
                if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
                    return false;
                }
                return (longitude >= -180 &&
                    longitude <= 180 &&
                    latitude >= -90 &&
                    latitude <= 90);
            },
            message: "coordinates는 [경도, 위도] 형식이며, 경도는 -180~180, 위도는 -90~90 범위여야 합니다.",
        },
    },
}, {
    _id: false,
});
const shopSchema = new mongoose_1.Schema({
    // 매장 이름
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    // 매장 유형
    category: {
        type: String,
        enum: shop_constants_js_1.SHOP_CATEGORIES,
        required: true,
    },
    // 전체 주소
    address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300,
    },
    // 시·도
    region1: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30,
    },
    // 시·군·구
    region2: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30,
    },
    // 읍·면·동
    region3: {
        type: String,
        default: null,
        trim: true,
        maxlength: 30,
    },
    // MongoDB 지도 검색에 사용하는 좌표
    location: {
        type: geoLocationSchema,
        required: true,
    },
    // 매장 전화번호
    phone: {
        type: String,
        default: null,
        trim: true,
        maxlength: 30,
    },
    // 매장 소개
    description: {
        type: String,
        default: null,
        trim: true,
        maxlength: 2000,
    },
    // 영업시간 안내 문구
    openingHours: {
        type: String,
        default: null,
        trim: true,
        maxlength: 300,
    },
    // 인스타그램 주소
    instagramUrl: {
        type: String,
        default: null,
        trim: true,
    },
    // 네이버 지도 주소
    naverMapUrl: {
        type: String,
        default: null,
        trim: true,
    },
    // 매장 이미지 목록
    images: {
        type: [shopImageSchema],
        default: [],
    },
    // 매장 정보 수집 출처
    sourceType: {
        type: String,
        enum: ["direct", "official", "user_suggestion", "public_data"],
        default: "direct",
        required: true,
    },
    // 매장을 좋아요한 사용자 수
    likeCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    // 매장 운영 및 노출 상태
    status: {
        type: String,
        enum: ["active", "temporarily_closed", "closed", "hidden"],
        default: "active",
        required: true,
    },
}, {
    // createdAt, updatedAt 자동 생성
    timestamps: true,
});
// 지도 반경 검색을 위한 인덱스
shopSchema.index({
    location: "2dsphere",
});
// 카테고리와 상태별 매장 조회
shopSchema.index({
    category: 1,
    status: 1,
});
// 지역별 매장 조회
shopSchema.index({
    region1: 1,
    region2: 1,
    region3: 1,
});
// 매장명, 주소, 설명 검색
shopSchema.index({
    name: "text",
    address: "text",
    description: "text",
});
// 운영 중인 매장을 좋아요 수가 많은 순서로 조회
shopSchema.index({
    status: 1,
    likeCount: -1,
});
const ShopModel = (0, mongoose_1.model)("Shop", shopSchema);
exports.default = ShopModel;
