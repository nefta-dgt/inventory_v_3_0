import type { NextFunction, Request, Response } from "express";

// Sumber kebenaran kunci izin inventory. Format fitur:aksi, sama dengan rental.
// Daftar mengikuti catatan INVENTORY-v3.0-REVISI-9/13-Plan-izin-akses-inventory.md
export const PERM = {
  purchaseRequest: {
    create: "purchase_request:create",
    view: "purchase_request:view",
    edit: "purchase_request:edit",
    approve: "purchase_request:approve",
    cancel: "purchase_request:cancel",
  },
  purchaseOrder: {
    create: "purchase_order:create",
    view: "purchase_order:view",
    edit: "purchase_order:edit",
    void: "purchase_order:void",
    correctPrice: "purchase_order:correct_price",
  },
  goodsReceived: {
    create: "goods_received:create",
    view: "goods_received:view",
    linkPo: "goods_received:link_po",
    void: "goods_received:void",
  },
  goodsAllocation: {
    create: "goods_allocation:create",
    edit: "goods_allocation:edit",
    void: "goods_allocation:void",
  },
  valuation: {
    view: "valuation:view",
    approve: "valuation:approve",
    reverse: "valuation:reverse",
  },
  goodsUsage: {
    create: "goods_usage:create",
    view: "goods_usage:view",
    void: "goods_usage:void",
  },
  expensesMaintenance: {
    create: "expenses_maintenance:create",
    view: "expenses_maintenance:view",
    void: "expenses_maintenance:void",
  },
  stock: { view: "stock:view" },
  masterData: { view: "master_data:view", manage: "master_data:manage" },
  auditLog: { view: "audit_log:view" },
} as const;

export const SUPERADMIN = "Superadmin";

export interface AuthUser {
  userId: string;
  username: string;
  name: string;
  role: string | null;
}

// Tahap build: hanya Superadmin yang punya izin ("*"). Izin per fitur menyusul
// dari access.role_permission dan access.user_permission setelah diputuskan.
export function effectivePermissions(user: AuthUser): string[] {
  return user.role === SUPERADMIN ? ["*"] : [];
}

export function can(user: AuthUser, key: string): boolean {
  const perms = effectivePermissions(user);
  return perms.includes("*") || perms.includes(key);
}

// Guard endpoint. Butuh requireAuth lebih dulu agar req.user terisi.
export function requirePermission(...keys: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Belum login" });
    if (!keys.every((k) => can(user, k))) return res.status(403).json({ error: "Tidak punya izin" });
    next();
  };
}
