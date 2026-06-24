# Blossom Wedding Planner 🌸

PWA perencanaan pernikahan untuk pasar Indonesia. React + Vite + TypeScript + Tailwind, backend Supabase (Auth + Postgres + Storage).

## Setup

```bash
npm install
cp .env.example .env   # lalu isi kredensial Supabase (anon key saja)
npm run dev
```

Buka `http://localhost:5173`.

### Variabel environment (`.env`)

| Variabel | Keterangan |
|---|---|
| `VITE_SUPABASE_URL` | Project URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | **anon** public key (JANGAN pakai service_role) |

### Prasyarat Supabase
1. Jalankan `docs/Blossom-Schema.sql` di SQL Editor.
2. Buat bucket Storage **`wedding-photos`** (private) + jalankan policy storage di akhir file SQL.
3. Aktivasi akun: setelah daftar, set `profiles.is_active = true` (manual/admin).

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Typecheck + build produksi |
| `npm run preview` | Pratinjau hasil build |

## Struktur modul

- **Auth gate** berlapis (login → menunggu aktivasi → akses berakhir → app) — gating di level app.
- **Dashboard** — countdown, progress checklist, ringkasan budget, tamu, vendor.
- **Acara + Vendor** — `<VendorItemCard>` reusable untuk semua kategori (field khusus di JSONB `details`).
- **Budget** — agregat per kategori + Auto Budget Allocator.
- **Checklist** — timeline 12 bulan (seed default).
- **Tamu + RSVP**, **Rundown**, **Dokumen KUA + upload foto**, **Seserahan/Mahar/Pendamping**, **Honeymoon + Hadiah**, **Reminder + ekspor .ics**.

## Konvensi
- Setiap insert/update menyertakan `user_id` (`auth.uid()`) & `wedding_id`.
- Frontend hanya memakai **anon key** lewat env.
- Satu komponen `<VendorItemCard>` untuk semua kategori vendor.
- Mobile-first. Font: Poppins (body), Cormorant Garamond (judul), Pinyon Script (aksen).

Dokumen acuan ada di `docs/`.
