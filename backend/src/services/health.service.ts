import { readDatabaseStatus } from "../repositories/health.repository";
import type { HealthReport } from "../types/health";

export async function getHealthReport(): Promise<HealthReport> {
  const timestamp = new Date().toISOString();

  try {
    const status = await readDatabaseStatus();

    return {
      status: "ok",
      database: "up",
      appName: status.appName,
      timestamp,
    };
  } catch (error) {
    console.error("No se pudo consultar PostgreSQL", error);

    return {
      status: "error",
      database: "down",
      appName: null,
      timestamp,
    };
  }
}
