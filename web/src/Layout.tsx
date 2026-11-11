import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from './auth'
import { menu } from './menu'

export default function Layout() {
  const { user, logout, can } = useAuth()
  const [open, setOpen] = useState(false)
  const items = menu.filter((m) => can(m.permission))

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Buka menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg border border-slate-300 px-2.5 py-1 text-lg leading-none hover:bg-slate-100 md:hidden"
          >
            ☰
          </button>
          <span className="font-semibold">Inventory v3.0</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm leading-tight">
            <div className="font-medium">{user?.name}</div>
            <div className="text-slate-500">{user?.role ?? 'tanpa role'}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {open && (
          <div
            className="fixed inset-0 top-14 z-10 bg-slate-900/20 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={`fixed bottom-0 left-0 top-14 z-20 w-60 shrink-0 border-r border-slate-200 bg-white p-3 md:static md:block ${
            open ? 'block' : 'hidden'
          }`}
        >
          <nav aria-label="Menu utama" className="space-y-1">
            {items.map((m) => (
              <NavLink
                key={m.path}
                to={m.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-slate-900 font-medium text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {m.label}
              </NavLink>
            ))}
            {items.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-500">Belum ada menu yang bisa diakses.</p>
            )}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
