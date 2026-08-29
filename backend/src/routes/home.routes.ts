import { Router } from "express";

import { getHomeCuratedShopsController } from "../controllers/home.controller";

export const homeRouter = Router();

homeRouter.get("/", getHomeCuratedShopsController);
