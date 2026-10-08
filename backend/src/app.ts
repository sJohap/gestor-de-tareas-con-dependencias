import express from "express";
import { errorHandler } from "./middlewares/error-handler";
import { healthRouter } from "./routes/health.routes";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "gestor-de-tareas",
      message: "API en marcha",
    });
  });

  app.use(healthRouter);
  app.use(errorHandler);

  return app;
}
