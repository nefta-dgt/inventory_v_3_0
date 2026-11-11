import pg from "pg";
import { env } from "./env.js";

// Skema hr dan access dipakai bersama modul lain. Dari inventory hanya dibaca.
export const pool = new pg.Pool(env.db);

pool.on("error", (err) => console.error("Koneksi database error:", err.message));
