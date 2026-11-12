import type { Pool, PoolClient } from "pg";
import { pool } from "../config/database";

export type Db = Pool | PoolClient;

export async function withTransaction<T>(work: (db: Db) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Se conserva el error original de la transacción.
    }
    throw error;
  } finally {
    client.release();
  }
}
