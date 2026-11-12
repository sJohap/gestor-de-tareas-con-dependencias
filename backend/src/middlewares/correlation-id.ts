import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const MAX_ID_LENGTH = 80;

export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header("x-correlation-id")?.trim();
  const id = incoming && incoming.length > 0 && incoming.length <= MAX_ID_LENGTH ? incoming : randomUUID();

  req.correlationId = id;
  res.setHeader("x-correlation-id", id);
  next();
}
