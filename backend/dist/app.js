"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
// import shopRoutes from "./routes/shop.routes";
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.env.clientOrigin,
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => {
    res.json({
        ok: true,
        message: "Sopum Map API is running",
    });
});
// app.use("/api/shops", shopRoutes);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
