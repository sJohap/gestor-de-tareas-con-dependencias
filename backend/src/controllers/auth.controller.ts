import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { loginUser, registerUser } from "../services/auth.service";
import { createAuthSession, revokeAuthSession, rotateAuthSession } from "../services/session.service";
import { HttpError } from "../utils/http-error";
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from "../utils/cookies";

export async function registerController(req: Request, res: Response): Promise<void> {
  const input = registerSchema.parse(req.body);
  const user = await registerUser(input);
  const session = await createAuthSession(user);

  setRefreshCookie(res, session.refreshToken);
  res.status(201).json({
    user: session.user,
    accessToken: session.accessToken,
  });
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body);
  const user = await loginUser(input);
  const session = await createAuthSession(user);

  setRefreshCookie(res, session.refreshToken);
  res.status(200).json({
    user: session.user,
    accessToken: session.accessToken,
  });
}

export async function refreshController(req: Request, res: Response): Promise<void> {
  const rawRefreshToken = readRefreshCookie(req);

  if (!rawRefreshToken) {
    throw new HttpError(401, "Sesión inválida");
  }

  const session = await rotateAuthSession(rawRefreshToken);
  setRefreshCookie(res, session.refreshToken);
  res.status(200).json({
    user: session.user,
    accessToken: session.accessToken,
  });
}

export async function logoutController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "Falta el token de acceso");
  }

  await revokeAuthSession(readRefreshCookie(req), req.user.id);
  clearRefreshCookie(res);
  res.status(204).send();
}

export async function meController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "Falta el token de acceso");
  }

  res.status(200).json({ user: req.user });
}
