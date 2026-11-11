import bcrypt from "bcryptjs";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { pool } from "./db.js";
import { effectivePermissions, type AuthUser } from "./permissions.js";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

// Nama cookie khusus inventory. Cookie localhost dipakai bersama semua port,
// jadi nama harus beda dari "connect.sid" milik rental.
export const SESSION_COOKIE = "inventory.sid";

// Dipakai agar waktu respons sama baik user ada maupun tidak.
const DUMMY_HASH = bcrypt.hashSync("tidak-dipakai", 10);

interface UserRow {
  user_id: string;
  username: string;
  password_hash: string;
  employee_name: string;
  is_active: boolean;
  role: string | null;
}

const toAuthUser = (r: UserRow): AuthUser => ({
  userId: r.user_id,
  username: r.username,
  name: r.employee_name,
  role: r.role,
});

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "Belum login" });
  const { rows } = await pool.query<UserRow>(
    "select user_id, username, password_hash, employee_name, is_active, role from hr.users where user_id = $1",
    [userId],
  );
  const row = rows[0];
  if (!row || !row.is_active) return res.status(401).json({ error: "Belum login" });
  req.user = toAuthUser(row);
  next();
}

const loginBody = z.object({ username: z.string().min(1), password: z.string().min(1) });

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Username dan password wajib diisi" });

  const { rows } = await pool.query<UserRow>(
    "select user_id, username, password_hash, employee_name, is_active, role from hr.users where username = $1",
    [parsed.data.username],
  );
  const row = rows[0];
  const match = await bcrypt.compare(parsed.data.password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !row.is_active || !match) {
    return res.status(401).json({ error: "Username atau password salah" });
  }

  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Gagal membuat sesi" });
    req.session.userId = row.user_id;
    const user = toAuthUser(row);
    res.json({ username: user.username, name: user.name, role: user.role });
  });
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie(SESSION_COOKIE);
    res.json({ ok: true });
  });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const user = req.user!;
  res.json({
    username: user.username,
    name: user.name,
    role: user.role,
    permissions: effectivePermissions(user),
  });
});
