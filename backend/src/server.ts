import { createApp } from "./app";
import { pool } from "./config/database";
import { env } from "./config/env";
import { jobQueue } from "./jobs/memory-queue";
import { deleteExpiredRefreshTokens } from "./repositories/refresh-token.repository";

jobQueue.register("purge-expired-sessions", async () => {
  await deleteExpiredRefreshTokens();
});
jobQueue.start();
jobQueue.enqueue("purge-expired-sessions");

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}`);
});

function shutdown(): void {
  jobQueue.stop();
  server.close(() => {
    void pool.end().finally(() => {
      process.exit(0);
    });
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
