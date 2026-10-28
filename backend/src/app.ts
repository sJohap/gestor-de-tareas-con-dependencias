import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error-handler";
import { authRouter } from "./routes/auth.routes";
import { healthRouter } from "./routes/health.routes";
import { taskRouter } from "./routes/task.routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "gestor-de-tareas",
      message: "API en marcha",
    });
  });

  app.use(healthRouter);
  app.use(authRouter);
  app.use(taskRouter);
  app.use(errorHandler);

  return app;
}
