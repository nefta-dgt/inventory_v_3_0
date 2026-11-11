// Menu utama sidebar. `permission` dipakai untuk menampilkan/menyembunyikan menu saja;
// pengaman sebenarnya ada di API (requirePermission).
export interface MenuItem {
  label: string
  path: string
  permission: string
}

export const menu: MenuItem[] = [
  { label: 'Purchase Request', path: '/purchase-request', permission: 'purchase_request:view' },
  { label: 'Purchase Order', path: '/purchase-order', permission: 'purchase_order:view' },
  { label: 'Inventory', path: '/inventory', permission: 'stock:view' },
  { label: 'Maintenance', path: '/maintenance', permission: 'expenses_maintenance:view' },
]
