import express from "express";
import session from "express-session";
import { env } from "./env.js";
import { pool } from "./db.js";
import { authRouter, SESSION_COOKIE } from "./auth.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use(
  session({
    name: SESSION_COOKIE,
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    // Sesi di memori server (sementara). Pindah ke penyimpanan permanen sebelum production.
    cookie: { httpOnly: true, sameSite: "lax", secure: env.isProd, maxAge: 1000 * 60 * 60 * 8 },
  }),
);

app.get("/api/health", async (_req, res) => {
  await pool.query("select 1");
  res.json({ ok: true });
});

app.use("/api", authRouter);

app.use("/api", (_req, res) => res.status(404).json({ error: "Endpoint tidak ditemukan" }));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Terjadi kesalahan di server" });
});

app.listen(env.port, () => console.log(`Inventory API di http://localhost:${env.port}`));
