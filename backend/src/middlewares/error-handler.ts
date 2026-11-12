import type { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error";

export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, _next) => {
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      status: "error",
      message: "El token de acceso expiró",
    });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      status: "error",
      message: "Token inválido",
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: "error",
      message: "Datos inválidos",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof SyntaxError && "type" in err && err.type === "entity.parse.failed") {
    res.status(400).json({
      status: "error",
      message: "El cuerpo de la petición no es un JSON válido",
    });
    return;
  }

  console.error(
    JSON.stringify({
      level: "error",
      time: new Date().toISOString(),
      correlationId: req.correlationId,
      message: err instanceof Error ? err.message : "Error interno",
    }),
  );
  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
  });
};
