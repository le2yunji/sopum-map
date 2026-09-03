import { Router } from "express";

import { getHomeCuratedShopsController } from "../controllers/home.controller.js";

export const homeRouter = Router();

homeRouter.get("/curated-shops", getHomeCuratedShopsController);
