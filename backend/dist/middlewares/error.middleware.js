"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const errorMiddleware = (error, _req, res, _next) => {
    console.error(error);
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: "요청 데이터 형식이 올바르지 않습니다.",
            errors: error.flatten(),
        });
    }
    return res.status(500).json({
        message: "서버 내부 오류가 발생했습니다.",
    });
};
exports.errorMiddleware = errorMiddleware;
