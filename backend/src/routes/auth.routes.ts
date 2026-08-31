import { Router } from "express";

import { startKakaoLogin } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.get("/kakao/start", startKakaoLogin);

export { authRouter };
