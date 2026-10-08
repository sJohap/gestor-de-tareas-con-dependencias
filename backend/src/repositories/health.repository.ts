import { pool } from "../config/database";

export type DatabaseStatus = {
  appName: string | null;
};

export async function readDatabaseStatus(): Promise<DatabaseStatus> {
  await pool.query("SELECT 1");

  const result = await pool.query<{ app_name: string }>(
    "SELECT app_name FROM app_meta WHERE id = 1"
  );

  return {
    appName: result.rows[0]?.app_name ?? null,
  };
}
