# Blossom — Instruksi Build untuk Claude Code

*Brief utama untuk membangun Blossom Wedding Planner modul demi modul. Pasangkan dengan `Blossom-Schema.sql` (skema database). Bangun & tes satu modul, lalu lanjut.*

---

## A. INSTRUKSI FONT (langsung pakai)

### Peran font

| Peran | Font | Sumber | Catatan |
|---|---|---|---|
| **Body / UI / teks isi** | **Poppins** | Google Fonts (gratis) | Tulang punggung antarmuka |
| **Header / judul** | **Cormorant Garamond** (weight 300 Light untuk header) | Google Fonts (gratis) | Elegan, premium |
| **Aksen script** (nama pasangan, tagline, flourish) | **Shelley Script** *(berlisensi)* → fallback **Pinyon Script / Great Vibes** (gratis) | Lihat di bawah | Pakai hemat, hanya untuk dekorasi |
| **Serif sekunder** (opsional, kutipan) | **EB Garamond** (gratis) *pengganti Adobe Garamond Pro* | Google Fonts | Hanya jika butuh serif kedua |

> **Penting:** Poppins, Cormorant Garamond, Pinyon Script, dan EB Garamond **gratis & langsung jalan** lewat Google Fonts. **Shelley Script** dan **Adobe Garamond Pro** **berlisensi** — hanya dipasang jika kamu punya file webfont-nya (lihat bagian @font-face). Untuk mulai build, gunakan font gratis dulu; ganti ke yang berlisensi belakangan kalau sudah punya lisensinya.

### Cara load font gratis (Google Fonts)

Masukkan di `index.html` (bagian `<head>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Cormorant+Garamond:wght@300;400;500;600&family=Pinyon+Script&family=EB+Garamond:wght@400;500&display=swap" rel="stylesheet">
```

### Mapping di Tailwind (`tailwind.config.js`)

```js
export default {
  theme: {
    extend: {
      fontFamily: {
        body:    ['Poppins', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        script:  ['"Pinyon Script"', 'cursive'],   // ganti ke "Shelley Script" jika berlisensi terpasang
        serif2:  ['"EB Garamond"', 'serif'],
      },
    },
  },
}
```

### Aturan pakai
- **Default semua teks:** `font-body` (Poppins).
- **Semua judul/heading:** `font-display` (Cormorant Garamond), gunakan weight `font-light` (300) untuk header besar agar terlihat elegan.
- **Aksen script:** `font-script` hanya untuk nama pasangan / tagline / 1–2 elemen dekoratif per layar. Jangan dipakai untuk teks panjang (tidak terbaca).

### Memasang font BERLISENSI (Shelley Script / Adobe Garamond Pro)
Jika kamu sudah punya file font-nya (`.woff2`/`.woff`), taruh di `/public/fonts/` lalu tambahkan di CSS global:

```css
@font-face {
  font-family: 'Shelley Script';
  src: url('/fonts/ShelleyScript.woff2') format('woff2');
  font-display: swap;
}
```
Lalu ubah `script` di tailwind config ke `'"Shelley Script"'`. (Adobe Garamond Pro: jika punya Adobe Fonts, pakai kit embed Adobe; jika tidak, gunakan EB Garamond.)

---

## B. DESIGN TOKENS (warna)

```js
// tailwind.config.js > theme.extend.colors
colors: {
  burgundy: { deep: '#4A0E22', mid: '#7A2040' },
  gold:     { warm: '#C9A227', light: '#E8C458' },
  cream:    '#F8F3EC',
  ink:      '#2C0E1A',   // almost black
}
```
Gaya: mobile-first, banyak ruang cream, aksen burgundy, sentuhan gold tipis (jangan berlebihan emas), kartu sudut membulat, ikon garis halus.

---

## C. CARA MEMAKAI SKEMA DATABASE

1. Jalankan `Blossom-Schema.sql` di Supabase SQL Editor (sekali).
2. Buat bucket Storage **`wedding-photos`** (PRIVATE), lalu jalankan bagian policy storage di akhir file SQL.
3. Frontend konek pakai `@supabase/supabase-js` dengan **Project URL** + **anon key**.
4. **Konsep inti — Kartu Vendor reusable:** tabel `vendor_items` dipakai untuk SEMUA kategori (venue, catering, dekorasi, MUA, dst.). Buat **satu komponen React `<VendorItemCard>`** yang menerima `category`, lalu field khusus per kategori disimpan di kolom `details` (JSONB). **Jangan** bikin 25 halaman/komponen terpisah.
5. Gating akun: setelah login, cek `profiles.is_active`. Jika `false` → tampilkan layar **"Akun menunggu aktivasi"** (pelanggan selesaikan bayar via WA). Jika ada `expires_at` dan sudah lewat → tampilkan layar "Akses berakhir".

---

## D. URUTAN BUILD MODUL (bangun & tes satu per satu)

> Target: SELURUH fitur dokumen terbangun. Yang diatur cuma urutannya — fondasi dulu, baru modul. Tes tiap modul sebelum lanjut.

### Modul 0 — Fondasi & Shell
- Scaffold React + Vite + Tailwind + PWA + `@supabase/supabase-js`.
- Setup font (Bagian A) + design tokens (Bagian B).
- Shell dengan **login (Supabase Auth)** sebagai gate + layar "menunggu aktivasi" (`is_active=false`).
- Bottom navigation: Dashboard · Budget · Acara · Tamu · More.
- **Tes:** daftar akun → muncul layar menunggu aktivasi → set `is_active=true` manual di Supabase → bisa masuk.

### Modul 1 — Onboarding + Wedding
- Form awal: nama pasangan + tanggal akad & resepsi → buat baris `weddings`.
- **Tes:** data tersimpan, muncul di dashboard.

### Modul 2 — Dashboard
- Tarik dari DB: countdown (engagement/akad/resepsi), progress checklist %, ringkasan budget (total/terpakai/sisa dari `vendor_items`), jumlah tamu RSVP hadir, jumlah vendor `booked`.
- **Tes:** angka berubah saat data modul lain diisi.

### Modul 3 — Kartu Vendor reusable + Modul Acara
- Komponen `<VendorItemCard>` (status, budget/aktual/selisih otomatis, DP/pelunasan, vendor_status, PIC, deadline, link, foto, catatan, `details`).
- Modul `events` (Lamaran/Akad/Resepsi) → di tiap event, daftar `vendor_items` per kategori.
- **Tes:** tambah/edit/hapus item di beberapa kategori; selisih & sisa terhitung benar.

### Modul 4 — Budget
- Tampilan agregat dari `vendor_items`: per kategori estimasi vs aktual vs selisih, total, alokasi (ring/bar), status bayar.
- **Tes:** cocok dengan angka dashboard.

### Modul 5 — Checklist & Timeline 12 Bulan
- Seed `checklist_items` default (fase 12–9 bln s/d 1 minggu) saat wedding dibuat.
- Ceklis, tambah item, progress update ke dashboard.
- **Tes:** centang item → progress dashboard naik.

### Modul 6 — Tamu + RSVP
- `guests`: tambah, kategori, jumlah pendamping, status RSVP manual; rekap (total/hadir/pending).
- **Tes:** rekap & angka dashboard benar.

### Modul 7 — Rundown Acara
- `rundown_items` per event: jam, kegiatan (dropdown + custom), PIC, lokasi, durasi, status; urut/drag.
- **Tes:** urutan tersimpan.

### Modul 8 — Dokumen KUA + Foto upload
- `documents`: seed daftar standar (N1–N6, KTP/KK/akta, dll.); status sudah/belum, due date, upload scan.
- Upload foto ke bucket `wedding-photos` (path `{user_id}/{wedding_id}/...`), simpan ke `vendor_photos`.
- **Tes:** upload & tampil foto; akun lain tak bisa akses (uji RLS storage).

### Modul 9 — Seserahan, Mahar, Bridesmaid/Groomsmen
- Seserahan & Mahar = `vendor_items` kategori khusus (pakai `details`).
- `party_members` untuk bridesmaid/groomsmen.
- **Tes:** CRUD lancar.

### Modul 10 — Honeymoon + Gift/Angpao
- `honeymoon` (destinasi + budget); `gifts` (registry + cash).
- **Tes:** CRUD lancar.

### Modul 11 — Reminder + fitur pintar (lokal, tanpa server)
- `reminders` + tombol **Export ke Kalender (.ics)** + notifikasi lokal PWA.
- **Auto Budget Allocator** (rule-based, jalan di client): bagi total budget ke kategori otomatis.
- **Tes:** .ics ter-download & terbaca di Google Calendar.

### Setelah Modul 11
- Uji menyeluruh semua modul (2 akun, cek RLS), install PWA di HP + laptop, alur aktivasi `is_active`.
- Beta ke beberapa pasangan → perbaiki → **jual.**

---

## E. KONVENSI PENTING (ingatkan ke Claude Code)
- **Selalu** sertakan `user_id` & `wedding_id` saat insert (untuk RLS & relasi).
- **Jangan** taruh `service_role` key di frontend — hanya `anon` key.
- Satu komponen `<VendorItemCard>` reusable, jangan duplikasi per kategori.
- Mobile-first; tes di layar HP.
- Bangun & commit per modul (Git). Jangan minta semua modul dalam satu prompt.

🌸
