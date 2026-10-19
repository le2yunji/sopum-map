import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

import { authRouter } from "./routes/auth.routes.js";
import { shopRouter } from "./routes/shop.routes.js";
import { homeRouter } from "./routes/home.routes.js";
import { meRouter } from "./routes/me.routes.js";
import { visitLogRouter } from "./routes/visit-log.routes.js";
import { courseRouter } from "./routes/course.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";

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

app.use("/api/me", meRouter);
app.use("/api/auth", authRouter);
app.use("/api/home", homeRouter);
app.use("/api/shops", shopRouter);
app.use("/api/courses", courseRouter);
app.use("/api/visit-logs", visitLogRouter);
app.use("/api/uploads", uploadRouter);

app.use(errorMiddleware);

export default app;
