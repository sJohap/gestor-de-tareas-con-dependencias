import { Router } from "express";
import { loginController, registerController } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/auth/register", (req, res, next) => {
  registerController(req, res).catch(next);
});

authRouter.post("/auth/login", (req, res, next) => {
  loginController(req, res).catch(next);
});
