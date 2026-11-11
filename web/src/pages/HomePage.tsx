import { useAuth } from '../auth'

export default function HomePage() {
  const { user, logout } = useAuth()
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Inventory v3.0</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.name} · {user?.role ?? 'tanpa role'}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
        >
          Keluar
        </button>
      </div>
      <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        Halaman utama masih kosong. Fitur menyusul.
      </p>
    </main>
  )
}
