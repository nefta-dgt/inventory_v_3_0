# Peraturan endpoint API: Inventory v3.0

Dokumen hidup. Setiap penyesuaian atau penambahan endpoint wajib memperbarui dokumen ini
dan menambah baris di bagian "Riwayat perubahan" di bawah.

Status tiap aturan: **berlaku** (sudah ada di kode) atau **disepakati** (sudah diputuskan, belum diterapkan).

## 1. Dasar
- Semua endpoint berawalan `/api`. Body dan respons berformat JSON.
- API berjalan di port 3100. Web (Vite) di port 5174 meneruskan `/api` ke API (proxy), jadi tidak ada CORS saat development. Berlaku.
- Pesan untuk pengguna dalam bahasa Indonesia. Berlaku.

## 2. Autentikasi
- Login memakai `hr.users` (username + password yang di-hash bcrypt). Berlaku.
- Sesi memakai cookie `inventory.sid` (httpOnly, sameSite lax, secure di production, berlaku 8 jam). Berlaku.
  Nama cookie sengaja berbeda dari rental (`connect.sid`) karena cookie localhost dipakai bersama semua port.
- Endpoint publik hanya: `GET /api/health`, `POST /api/login`, `POST /api/logout`. Semua endpoint lain wajib login. Berlaku.
- Pesan gagal login selalu sama ("Username atau password salah") agar tidak membocorkan apakah username ada. Berlaku.
- Respons tidak boleh memuat `password_hash` atau data rahasia lain. Berlaku.

## 3. Izin (permission)
- Format kunci `fitur:aksi`, contoh `goods_received:create`. Berlaku.
- Sumber kebenaran daftar kunci: `api/src/permissions.ts` (objek `PERM`). Endpoint memakai konstanta itu, bukan teks bebas. Berlaku.
- Setiap endpoint (selain yang publik) mendeklarasikan izin yang dibutuhkan dengan guard `requirePermission(...)`, dipasang setelah `requireAuth`. Berlaku.
- Jika guard diberi lebih dari satu kunci, user harus punya semuanya. Berlaku.
- Superadmin punya `*` (semua izin). Saat ini hanya Superadmin yang punya izin; izin per fitur menunggu keputusan. Berlaku.
- Menyembunyikan menu atau tombol di web hanya soal kenyamanan. Pengaman sebenarnya adalah guard di API. Berlaku.
- Aturan "milik sendiri" (misalnya requester hanya boleh membatalkan permintaannya sendiri) memakai kolom `scope`, bukan kunci tambahan. Disepakati.
- Izin tidak dicek lewat nama role di banyak tempat (`if role == ...`). Semua lewat `can()` dan `requirePermission`. Berlaku.

## 4. Penamaan dan bentuk rute
- Nama sumber daya: kebab-case, jamak. Contoh `/purchase-requests`, `/goods-received`. Disepakati.
- Pemetaan metode HTTP ke aksi:

| Metode | Arti | Kunci izin |
|---|---|---|
| `GET /sumber-daya` | daftar / pencarian | `fitur:view` |
| `GET /sumber-daya/:id` | detail | `fitur:view` |
| `POST /sumber-daya` | membuat | `fitur:create` |
| `PATCH /sumber-daya/:id` | mengubah (jika diizinkan SOP) | `fitur:edit` |
| `POST /sumber-daya/:id/<aksi>` | aksi khusus: `approve`, `cancel`, `void`, `link-po`, dan sejenisnya | `fitur:<aksi>` |

- Tidak ada `DELETE`. Dokumen tidak pernah dihapus; dibatalkan atau di-void (lihat bagian 7). Disepakati.
- Id di URL memakai UUID. Disepakati.

## 5. Format respons
- Sukses: objek atau daftar JSON langsung, tanpa pembungkus tambahan. Berlaku.
- Error: `{ "error": "pesan dalam bahasa Indonesia" }`. Berlaku.
- Kode status:

| Kode | Dipakai untuk |
|---|---|
| 200 | berhasil (baca, ubah, aksi) |
| 201 | berhasil membuat data baru. Disepakati |
| 400 | body atau parameter tidak valid |
| 401 | belum login |
| 403 | login tapi tidak punya izin |
| 404 | data atau endpoint tidak ada |
| 409 | aksi bertentangan dengan status data (misalnya mengubah request yang sudah approved). Disepakati |
| 500 | kesalahan server. Detail hanya di log server, tidak dikirim ke klien. Berlaku |

## 6. Validasi
- Body divalidasi dengan zod sebelum diproses; gagal menghasilkan 400. Berlaku.
- Query SQL selalu berparameter (`$1`, `$2`), tidak menyambung string dari input. Berlaku.

## 7. Aturan data (dari ERD dan SOP Revisi 9)
- Dokumen tidak dihapus. Pembatalan dan void mencatat siapa, kapan, dan alasan (`voided_at/by/reason`). Alasan wajib diisi. Disepakati.
- Aksi yang menulis ke beberapa tabel dilakukan dalam satu transaksi database. Disepakati.
- Perubahan status penting dan pembatalan ditulis ke `change_log` (append-only) dalam transaksi yang sama. Disepakati.
- Setelah request di-approve, isinya tidak bisa diubah, hanya dibatalkan (SOP PR). Disepakati.
- API menulis ke skema `inventory`. Skema `hr` dan `access` milik bersama dan hanya dibaca dari inventory. Berlaku.

## 8. Belum diputuskan
- Format paginasi dan filter daftar.
- Format tanggal dan angka di JSON (qty memakai numeric 14,3 dan harga 14,4, jadi kemungkinan dikirim sebagai string).
- Pembatasan percobaan login dan penyimpanan sesi permanen (wajib sebelum production).

## 9. Daftar endpoint saat ini

| Metode | Path | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/health` | publik | cek server dan koneksi database |
| POST | `/api/login` | publik | body `{ username, password }`; 400 jika kosong, 401 jika salah |
| POST | `/api/logout` | publik | menghapus sesi |
| GET | `/api/me` | login | data user dan daftar izin efektif |

## 10. Draft endpoint ke izin (nama rute bisa berubah)

| Endpoint | Izin |
|---|---|
| `GET /goods-received` | `goods_received:view` |
| `POST /goods-received` | `goods_received:create` |
| `POST /goods-received/:id/link-po` | `goods_received:link_po` |
| `POST /goods-received/:id/void` | `goods_received:void` |
| `POST /purchase-requests/:id/approve` | `purchase_request:approve` |
| `POST /valuations` | `valuation:approve` |

Daftar lengkap kunci izin: `api/src/permissions.ts` dan catatan `INVENTORY-v3.0-REVISI-9/13-Plan-izin-akses-inventory.md`.

## Riwayat perubahan

| Tanggal | Perubahan |
|---|---|
| 2026-11-11 | Dokumen dibuat. Memuat aturan dasar, autentikasi, izin, penamaan rute, format respons, aturan data, dan daftar endpoint awal (health, login, logout, me). |
| 2026-11-11 | Nama file diganti dari `api-endpoint-rules.md` menjadi `inventory-3-0-api-endpoint-rules.md`. Isi tidak berubah. |
