# Inventory v3.0

- Repo ini terpisah dari proyek rental. Jangan menyentuh atau mencampur kode rental.
- Struktur: `api/` (Express 5, TypeScript) dan `web/` (React + Vite). Jalankan keduanya dengan `npm run dev`.
- Port: API 3100, web 5174. Rental memakai 5173 dan 3200.

## Dokumen yang wajib selalu diperbarui
`docs/inventory-3-0-api-endpoint-rules.md` adalah peraturan endpoint API. Setiap kali menambah, mengubah, atau
menghapus endpoint, atau mengubah aturan (autentikasi, izin, format respons, kode status):
1. Perbarui bagian yang terkait di dokumen itu (termasuk tabel "Daftar endpoint saat ini").
2. Tambah satu baris di "Riwayat perubahan" dengan tanggal dan ringkasan.
3. Jika ada kunci izin baru, tambahkan di `api/src/permissions.ts`.
