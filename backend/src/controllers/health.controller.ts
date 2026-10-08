import type { Request, Response } from "express";
import { getHealthReport } from "../services/health.service";

export async function healthController(_req: Request, res: Response): Promise<void> {
  const report = await getHealthReport();
  const statusCode = report.database === "up" ? 200 : 503;
  res.status(statusCode).json(report);
}
