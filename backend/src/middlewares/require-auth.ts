import type { NextFunction, Request, Response } from "express";
import { findUserById } from "../repositories/user.repository";
import { HttpError } from "../utils/http-error";
import { verifyAccessToken } from "../utils/access-token";

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new HttpError(401, "Falta el token de acceso");
    }

    const token = header.slice("Bearer ".length).trim();

    if (!token) {
      throw new HttpError(401, "Falta el token de acceso");
    }

    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      throw new HttpError(401, "Token inválido");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
