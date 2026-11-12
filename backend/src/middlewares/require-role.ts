import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../types/user";
import { HttpError } from "../utils/http-error";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new HttpError(401, "Falta el token de acceso"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, "No tienes permiso para esta acción"));
      return;
    }

    next();
  };
}
