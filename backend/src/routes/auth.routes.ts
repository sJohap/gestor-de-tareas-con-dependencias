import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController,
} from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/require-auth";

export const authRouter = Router();

authRouter.post("/auth/register", (req, res, next) => {
  registerController(req, res).catch(next);
});

authRouter.post("/auth/login", (req, res, next) => {
  loginController(req, res).catch(next);
});

authRouter.post("/auth/refresh", (req, res, next) => {
  refreshController(req, res).catch(next);
});

authRouter.post("/auth/logout", requireAuth, (req, res, next) => {
  logoutController(req, res).catch(next);
});

authRouter.get("/auth/me", requireAuth, (req, res, next) => {
  meController(req, res).catch(next);
});
