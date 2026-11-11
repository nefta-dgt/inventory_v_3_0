export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        Halaman ini masih kosong. Fitur menyusul.
      </p>
    </div>
  )
}
