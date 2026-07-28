"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnv = ["MONGODB_URI"];
requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`${key} 환경변수가 필요합니다.`);
    }
});
exports.env = {
    port: Number(process.env.PORT || 4000),
    clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    mongodbUri: process.env.MONGODB_URI,
};
