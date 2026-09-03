import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

import { authRouter } from "./routes/auth.routes.js";
import { shopRouter } from "./routes/shop.routes.js";
import { homeRouter } from "./routes/home.routes.js";

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "Sopum Map API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/home", homeRouter);
app.use("/api/shops", shopRouter);

app.use(errorMiddleware);

export default app;
