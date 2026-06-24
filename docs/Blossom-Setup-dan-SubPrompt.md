# Blossom — Panduan Setup dari Nol + Sub-Prompt

*Bagian 1: cara setup lingkungan & akun dari awal sampai siap ngoding. Bagian 2: sub-prompt untuk modul yang besar (3, 8, 11) supaya tiap potongan kecil & mudah dites.*

---

# BAGIAN 1 — SETUP DARI NOL

Ikuti urut. Jangan lompat. Tanda ☑ = pastikan berhasil sebelum lanjut.

## Langkah 1 — Pasang tools di komputer

**a. Node.js (wajib — untuk menjalankan app React/Vite-mu)**
- Unduh versi **LTS** dari https://nodejs.org (saat ini v22). Jalankan installer, pastikan "Add to PATH" tercentang (Windows).
- **Tutup terminal, buka baru**, lalu cek:
  ```
  node --version     (harus v18 atau lebih tinggi)
  npm --version
  ```
  ☑ Muncul nomor versi.

**b. Git (untuk version control)**
- macOS: `xcode-select --install` atau `brew install git`. Windows: unduh dari https://git-scm.com.
- Cek: `git --version`. ☑ Muncul versi.

**c. Code editor (disarankan)** — VS Code (https://code.visualstudio.com). Opsional tapi membantu.

**d. Claude Code** — pilih SATU cara:
- **Cara termudah (tanpa terminal): Aplikasi Claude Desktop → tab Code.** Unduh Claude Desktop, masuk, buka tab "Code", arahkan ke folder proyekmu. Ini mengelola Claude Code untukmu.
- **Cara terminal (npm):** butuh Node 18+ (sudah dari langkah 1a). Jalankan:
  ```
  npm install -g @anthropic-ai/claude-code
  ```
  Jangan pakai `sudo`. Lalu cek: `claude --version`. Untuk menjalankan: masuk ke folder proyek lalu ketik `claude`.
- *(Cara lain — installer native tanpa Node — ada di dokumentasi resmi: https://docs.claude.com/en/docs/claude-code/overview)*

> **Catatan biaya:** memakai Claude Code butuh **paket Claude berbayar** (Claude Pro/Max) atau kredit API. Memasangnya gratis, tapi penggunaannya tidak.

---

## Langkah 2 — Buat akun

- **GitHub** — https://github.com (gratis). Untuk menyimpan kode.
- **Supabase** — https://supabase.com (gratis). Untuk database, login, & storage.
- *(Cloudflare & domain belum perlu sekarang — itu nanti saat mau online.)*

☑ Kedua akun aktif.

---

## Langkah 3 — Siapkan Supabase

1. Di Supabase, **New project**. Pilih region terdekat (mis. Singapore). Catat **database password**.
2. Tunggu project selesai dibuat (~2 menit).
3. Buka **SQL Editor → New query** → tempel SELURUH isi `Blossom-Schema.sql` → **Run**.
   ☑ Tidak ada error merah (muncul "Success").
4. Buka **Storage → New bucket** → nama **`wedding-photos`** → **uncheck "Public"** (jadikan privat) → Create.
5. Balik ke **SQL Editor**, jalankan bagian *policy storage* di akhir file `Blossom-Schema.sql` (blok `create policy "wedding_photos_own" ...`).
6. Buka **Project Settings → API**, catat dua hal ini (nanti dipakai):
   - **Project URL** (mis. `https://xxxx.supabase.co`)
   - **anon public key** (kunci panjang yang diawali `eyJ...`)
   ⚠️ Jangan pakai `service_role` key — itu rahasia, jangan masuk ke kode frontend.

☑ Skema jalan, bucket dibuat, URL + anon key dicatat.

---

## Langkah 4 — Buat folder proyek & repo

1. Di GitHub, **New repository** → nama mis. `blossom` → Private → Create. (Boleh kosong dulu.)
2. Di komputer, buat folder dan masuk ke dalamnya, mis:
   ```
   mkdir blossom && cd blossom
   git init
   ```
   (Atau clone repo GitHub yang barusan dibuat: `git clone <url-repo>` lalu `cd blossom`.)
3. Buat folder `docs` di dalamnya, dan **taruh 3 file ini ke `blossom/docs/`**:
   - `Blossom-Schema.sql`
   - `Blossom-Instruksi-Build-ClaudeCode.md`
   - `Blossom-Prompt-ClaudeCode.md`
   (Plus file ini juga boleh, biar lengkap.)

☑ Folder `blossom/docs/` berisi file-file acuan.

---

## Langkah 5 — Buka folder dengan Claude Code & mulai

1. Buka folder `blossom` dengan Claude Code (tab Code di Desktop, atau ketik `claude` di terminal dari dalam folder `blossom`).
2. Kirim **"PROMPT AWAL"** (dari file `Blossom-Prompt-ClaudeCode.md`). Claude Code akan membaca `/docs` dan konfirmasi paham.
3. Kirim **MODUL 0**. Setelah Claude Code selesai scaffold:
   - Ia akan membuat file `.env.example`. **Buat file `.env`** (salin dari `.env.example`) dan isi:
     ```
     VITE_SUPABASE_URL=<Project URL dari Langkah 3>
     VITE_SUPABASE_ANON_KEY=<anon key dari Langkah 3>
     ```
   - Jalankan app lokal (Claude Code akan beri perintahnya, biasanya `npm install` lalu `npm run dev`) → buka di browser (biasanya `http://localhost:5173`).
4. **Tes Modul 0:** daftar akun → muncul layar "menunggu aktivasi" → di Supabase (Table Editor → `profiles`) ubah `is_active` jadi `true` untuk akunmu → reload → masuk shell.

☑ Modul 0 jalan & lolos tes.

---

## Langkah 6 — Lanjut modul demi modul

Dari sini ikuti `Blossom-Prompt-ClaudeCode.md`: **Modul 1 → 2 → 3 (pakai sub-prompt di bawah) → ... → 11 → Penutup.**
Setelah tiap modul **lolos tes**, commit:
```
git add -A
git commit -m "Modul X: <ringkasan>"
```

---

## Ringkasan checklist setup
- [ ] Node.js LTS terpasang (`node --version` ≥ 18)
- [ ] Git terpasang
- [ ] Claude Code siap (Desktop tab Code, atau `claude` di terminal)
- [ ] Paket Claude berbayar aktif
- [ ] Akun GitHub & Supabase
- [ ] Project Supabase dibuat
- [ ] `Blossom-Schema.sql` dijalankan (Success)
- [ ] Bucket `wedding-photos` (private) + policy storage
- [ ] Project URL + anon key dicatat
- [ ] Folder `blossom` + repo + `docs/` berisi file acuan
- [ ] Prompt Awal & Modul 0 terkirim, `.env` terisi, Modul 0 lolos tes

---

# BAGIAN 2 — SUB-PROMPT MODUL BESAR

Tiga modul ini menggabung beberapa hal, jadi dipecah agar kecil & mudah dites. Pakai sub-prompt ini menggantikan prompt utuhnya.

## MODUL 3 → dipecah jadi 3A & 3B

### Prompt 3A — Komponen VendorItemCard + daftar vendor
```
Bangun MODUL 3A — komponen reusable <VendorItemCard> + halaman daftar vendor (tabel vendor_items).

<VendorItemCard> menampilkan & mengedit field: title, status (selesai/ragu/belum_selesai/sudah_survey/belum_survey), vendor_name, vendor_status (prospect/survey/quotation/negotiation/booked/paid/completed), pic (pria/wanita/lainnya), budget_estimate, budget_actual (tampilkan budget_difference & remaining_payment yang DIHITUNG DB, read-only), dp, paid_amount, is_paid_off, due_date, deadline, reference_links[], notes. Tambah/edit/hapus.

Halaman "Vendor": tampilkan vendor_items DIKELOMPOKKAN per kategori — venue, attire, cincin, dekorasi, catering, dokumentasi, souvenir, transportasi, mua, mc, florist, music, mahar, seserahan, buku_tamu_undangan, lainnya. Untuk sekarang item dibuat di level wedding (event_id boleh null).

Setiap insert SELALU sertakan user_id (auth.uid()) & wedding_id. BELUM usah foto & field "details" — itu menyusul. Fokus CRUD + perhitungan budget benar.
```
**Tes 3A:** tambah item di beberapa kategori; budget_difference & remaining_payment benar; angka muncul di Budget & Dashboard.

### Prompt 3B — Modul Acara + field khusus kategori
```
Bangun MODUL 3B — modul Acara (events) + field khusus per kategori.

A. CRUD events: name (Lamaran/Akad/Resepsi/custom), event_date, time_start, time_end, location_name, maps_link, address, indoor_outdoor (indoor/outdoor), notes. Urut dengan sort_order.

B. Di dalam tiap event, tampilkan vendor_items milik event itu (set event_id), tetap dikelompokkan per kategori, pakai <VendorItemCard>. User bisa membuat item langsung di dalam event atau memindahkan item level-wedding ke sebuah event.

C. Tambahkan field khusus per kategori lewat kolom JSONB "details", dan UI menampilkannya sesuai kategori:
   - catering: menu[], porsi_disediakan, porsi_terpakai, food_testing
   - attire: warna, style, jadwal_fitting, status_fitting
   - dekorasi: tema, detail[] (Pelaminan/Backdrop/Welcome gate/Lighting/dll)
   - seserahan: kategori, barang
   - (kategori lain: cukup catatan umum dulu)
```
**Tes 3B:** buat event, tambah item di dalamnya; field khusus muncul sesuai kategori; data tetap konsisten di Budget/Dashboard.

---

## MODUL 8 → dipecah jadi 8A & 8B

### Prompt 8A — Infrastruktur upload foto
```
Bangun MODUL 8A — upload foto via Supabase Storage (bucket "wedding-photos", private).

- Buat fungsi upload reusable: path "{user_id}/{wedding_id}/{timestamp}-{namafile}".
- Sebelum upload, kompres/resize gambar di client (maks sisi terpanjang ~1600px) untuk hemat storage.
- Tampilkan foto pakai signed URL.
- Integrasikan ke <VendorItemCard>: tiap item bisa upload beberapa foto → simpan ke tabel vendor_photos (sertakan user_id & wedding_id) → tampilkan thumbnail → bisa hapus.
```
**Tes 8A:** upload foto di sebuah item, tampil; login akun lain → tidak bisa akses foto akun pertama (uji RLS storage).

### Prompt 8B — Dokumen KUA
```
Bangun MODUL 8B — Checklist Dokumen KUA (tabel documents).

Saat wedding dibuat, SEED daftar dokumen standar berikut bila belum ada (status default 'belum'):
Surat Pengantar Nikah dari Desa/Kelurahan (N1); Surat Keterangan Untuk Nikah; Surat Keterangan Asal Usul; Surat Persetujuan Mempelai; Surat Keterangan Tentang Orang Tua; Surat Izin Orang Tua (jika usia < 21 th); Fotokopi KTP CPW; Fotokopi KTP CPP; Fotokopi KTP Saksi; Fotokopi KTP Orang Tua; Fotokopi Kartu Keluarga; Fotokopi Akta Lahir; Surat Keterangan Sehat / Imunisasi Calon Istri; Surat Pernyataan Belum Pernah Kawin dari Desa/Kelurahan; Pas Foto Background Biru 2x3 (5 lembar); Pas Foto Background Biru 3x5 (5 lembar).

Fitur: status sudah/belum, owner (groom/bride/saksi/orangtua/bersama), due_date, upload scan (file_url ke bucket, pakai fungsi upload dari 8A), notes, dan progress % (berapa dokumen 'sudah').
```
**Tes 8B:** centang beberapa dokumen → progress naik; upload scan berfungsi.

---

## MODUL 11 → dipecah jadi 11A & 11B

### Prompt 11A — Reminder + Kalender + Notifikasi
```
Bangun MODUL 11A — Reminder.

- CRUD reminders (tabel reminders): title, remind_at, type (payment/ring/guest_final/catering_final/rundown_final/custom), is_done. Tampilkan daftar reminder mendatang (urut waktu).
- Tombol "Export ke Kalender (.ics)": generate file .ics DI CLIENT (tanpa server) berisi reminder & deadline penting (dari vendor_items.deadline/due_date), bisa diimpor ke Google Calendar.
- Notifikasi lokal PWA via Notification API (minta izin sekali; tampilkan notifikasi untuk reminder yang jatuh tempo saat app dibuka).
```
**Tes 11A:** file .ics ter-download & berhasil diimpor/terbaca di Google Calendar.

### Prompt 11B — Auto Budget Allocator
```
Bangun MODUL 11B — Auto Budget Allocator (rule-based, jalan sepenuhnya di client, tanpa AI/server).

- Input: total budget + jumlah tamu.
- Output: saran alokasi per kategori, mis. venue+catering ~50%, dekorasi ~15%, dokumentasi ~10%, attire+MUA ~10%, lainnya ~15% (persentase boleh kamu rapikan & jelaskan). Semua angka EDITABLE oleh user.
- Saat user setuju, buat vendor_items untuk tiap kategori dengan budget_estimate terisi sesuai alokasi (sertakan user_id & wedding_id).
```
**Tes 11B:** angka alokasi wajar & total = budget; item terbuat dengan estimasi terisi; muncul di Budget.

---

## Pengingat
- Satu sub-prompt = satu potongan. Tes dulu sebelum lanjut.
- Ada error? Balas: *"Ada error: [tempel error]. Perbaiki."* — jangan lanjut sebelum beres.
- Commit tiap potongan lolos tes.

🌸
