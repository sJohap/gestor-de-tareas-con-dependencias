import { createApp } from "./app";
import { pool } from "./config/database";
import { env } from "./config/env";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}`);
});

function shutdown(): void {
  server.close(() => {
    void pool.end().finally(() => {
      process.exit(0);
    });
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
