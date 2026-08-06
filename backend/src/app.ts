import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { shopRouter } from "./routes/shop.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

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

app.use("/api/shops", shopRouter);

app.use(errorMiddleware);

export default app;
