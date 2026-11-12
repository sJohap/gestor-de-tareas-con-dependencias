import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { correlationId } from "./middlewares/correlation-id";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";
import { requestLogger } from "./middlewares/request-logger";
import { adminRouter } from "./routes/admin.routes";
import { authRouter } from "./routes/auth.routes";
import { healthRouter } from "./routes/health.routes";
import { taskRouter } from "./routes/task.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "500kb" }));
  app.use(correlationId);
  app.use(requestLogger);

  app.get("/", (_req, res) => {
    res.json({
      name: "gestor-de-tareas",
      message: "API en marcha",
    });
  });

  app.use(healthRouter);
  app.use(authRouter);
  app.use(taskRouter);
  app.use(adminRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
