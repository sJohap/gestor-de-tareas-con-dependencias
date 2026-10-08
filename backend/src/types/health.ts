export type HealthReport = {
  status: "ok" | "error";
  database: "up" | "down";
  appName: string | null;
  timestamp: string;
};
