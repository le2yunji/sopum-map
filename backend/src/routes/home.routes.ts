import { Router } from "express";

import { getHomeController } from "../controllers/home.controller";

export const homeRouter = Router();

homeRouter.get("/", getHomeController);
