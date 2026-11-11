import { config } from "dotenv";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Default: .env.staging di folder inventory_v_3_0. ENV_FILE relatif dihitung dari folder itu.
const root = fileURLToPath(new URL("../../", import.meta.url));
const envFile = resolve(root, process.env.ENV_FILE ?? ".env.staging");
const loaded = config({ path: envFile, quiet: true });
// Di production variabel biasanya datang dari environment server, bukan file.
if (loaded.error && process.env.NODE_ENV !== "production") throw new Error(`File env tidak ditemukan: ${envFile}`);

const isProd = process.env.NODE_ENV === "production";

function sessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (isProd) throw new Error("SESSION_SECRET wajib diisi di production");
  console.warn("SESSION_SECRET kosong: memakai rahasia acak. Sesi hilang setiap server restart.");
  return randomBytes(32).toString("hex");
}

export const env = {
  isProd,
  port: Number(process.env.PORT ?? 3100),
  sessionSecret: sessionSecret(),
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};
