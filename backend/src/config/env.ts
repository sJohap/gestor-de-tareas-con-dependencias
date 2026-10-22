import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

const port = Number(process.env.PORT ?? 3000);
const accessTokenTtlSeconds = Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 900);
const refreshTokenTtlSeconds = Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT debe ser un número entero mayor que 0");
}

if (!Number.isInteger(accessTokenTtlSeconds) || accessTokenTtlSeconds <= 0) {
  throw new Error("ACCESS_TOKEN_TTL_SECONDS debe ser un número entero mayor que 0");
}

if (!Number.isInteger(refreshTokenTtlSeconds) || refreshTokenTtlSeconds <= 0) {
  throw new Error("REFRESH_TOKEN_TTL_SECONDS debe ser un número entero mayor que 0");
}

export const env = {
  port,
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  accessTokenTtlSeconds,
  refreshTokenTtlSeconds,
  cookieSecure: process.env.COOKIE_SECURE === "true",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
};
