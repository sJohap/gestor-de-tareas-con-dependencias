import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { loginUser, registerUser } from "../services/auth.service";
import { HttpError } from "../utils/http-error";
import { signAccessToken } from "../utils/access-token";

export async function registerController(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);
  res.status(201).json({
    user,
    accessToken: signAccessToken(user),
  });
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const user = await loginUser(input);
  res.status(200).json({
    user,
    accessToken: signAccessToken(user),
  });
}

export async function meController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "Falta el token de acceso");
  }

  res.status(200).json({ user: req.user });
}
