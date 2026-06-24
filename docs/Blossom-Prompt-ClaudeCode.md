# Blossom — Kumpulan Prompt untuk Claude Code

*Copy satu prompt → tempel ke Claude Code → biarkan selesai → tes → `git commit` → lanjut prompt berikutnya. Jangan lompati urutan. Jangan gabung beberapa modul dalam satu prompt.*

**Sebelum mulai:**
1. Taruh `Blossom-Schema.sql` dan `Blossom-Instruksi-Build-ClaudeCode.md` di folder `/docs` dalam repo, supaya Claude Code bisa membacanya.
2. Siapkan Supabase **Project URL** + **anon key** (dari Supabase > Project Settings > API).
3. Jalankan dulu `Blossom-Schema.sql` di Supabase SQL Editor + buat bucket `wedding-photos` (private).

---

## PROMPT AWAL — Konteks proyek (kirim sekali di awal)

```
Saya membangun "Blossom Wedding Planner" — web app PWA perencanaan pernikahan untuk pasar Indonesia. Backend memakai Supabase (Auth + Postgres + Storage), frontend React + Vite + Tailwind.

Tolong baca dulu dua file ini di folder /docs sebagai acuan utama:
- /docs/Blossom-Schema.sql  (skema database yang SUDAH saya jalankan di Supabase — patuhi nama tabel & kolomnya persis)
- /docs/Blossom-Instruksi-Build-ClaudeCode.md  (instruksi font, design token, konvensi, urutan modul)

Konvensi yang WAJIB dipatuhi di seluruh proyek:
- Setiap insert/update SELALU menyertakan user_id (auth.uid()) dan wedding_id.
- Hanya pakai anon key di frontend (lewat env), JANGAN service_role key.
- Buat SATU komponen <VendorItemCard> reusable untuk semua kategori vendor; field khusus per kategori disimpan di kolom JSONB "details". Jangan duplikasi komponen per kategori.
- Mobile-first. Font: Poppins (body), Cormorant Garamond Light (header), Pinyon Script (aksen). Warna: burgundy #4A0E22/#7A2040, gold #C9A227/#E8C458, cream #F8F3EC, ink #2C0E1A.

Jangan tulis kode dulu di pesan ini. Konfirmasi kamu sudah membaca kedua file dan ringkas rencana implementasi Modul 0. Saya akan kirim perintah build per modul.
```

---

## MODUL 0 — Fondasi, Shell & Login

```
Bangun MODUL 0 (fondasi):

1. Scaffold project React + Vite + Tailwind + PWA (vite-plugin-pwa) + @supabase/supabase-js.
2. Setup font & design token sesuai /docs (Poppins, Cormorant Garamond, Pinyon Script, EB Garamond via Google Fonts; warna burgundy/gold/cream/ink di tailwind.config).
3. Buat client Supabase membaca VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dari .env (buatkan .env.example).
4. Auth (Supabase Auth, email+password): halaman Daftar & Masuk.
5. Setelah login, cek tabel profiles:
   - jika is_active = false → tampilkan layar "Akun Menunggu Aktivasi" (pesan: selesaikan pembayaran via WhatsApp, akun akan diaktifkan admin).
   - jika expires_at tidak null dan sudah lewat → layar "Akses Berakhir".
   - jika aktif → masuk ke app shell.
6. App shell: bottom navigation (mobile) berisi Dashboard, Budget, Acara, Tamu, More. Routing pakai react-router. Untuk sekarang halaman-halaman boleh placeholder kosong.
7. Buat PWA manifest + service worker dasar (installable, ada nama "Blossom", ikon, warna tema burgundy).

Desain harus terlihat premium & elegan (banyak ruang cream, header Cormorant Garamond Light). Setelah selesai, beri tahu saya cara menjalankannya di lokal dan apa yang harus saya isi di .env.
```
**Tes:** daftar akun → muncul layar menunggu aktivasi → di Supabase set `profiles.is_active=true` untuk akunmu → reload → masuk ke shell. Install PWA di HP.

---

## MODUL 1 — Onboarding + Wedding

```
Bangun MODUL 1 (onboarding):

Saat user aktif pertama kali masuk dan belum punya baris di tabel "weddings", tampilkan form onboarding singkat:
- Nama mempelai pria (groom_name) & nama panggilan (groom_nickname)
- Nama mempelai wanita (bride_name) & nama panggilan (bride_nickname)
- Tanggal lamaran (date_engagement, opsional)
- Tanggal akad (date_akad)
- Tanggal resepsi (date_resepsi)
- Total budget (total_budget, opsional)

Simpan ke tabel weddings (sertakan user_id). Setelah tersimpan, arahkan ke Dashboard. Sediakan juga halaman Pengaturan untuk mengedit data ini nanti. Buat onboarding terasa hangat & cepat (maks 60 detik).
```
**Tes:** isi form → data masuk ke tabel `weddings` → diarahkan ke dashboard.

---

## MODUL 2 — Dashboard

```
Bangun MODUL 2 (Dashboard) — tarik data REAL dari DB:

- Header: nama pasangan (groom_nickname & bride_nickname) + tanggal resepsi.
- Countdown ke akad & resepsi (hitung dari date_akad/date_resepsi).
- Progress checklist (% item is_done dari checklist_items).
- Ringkasan budget: total (weddings.total_budget), terpakai (SUM vendor_items.budget_actual), sisa.
- Jumlah tamu hadir (count guests rsvp_status='hadir') dan total tamu.
- Jumlah vendor "booked" (count vendor_items vendor_status='booked').

Tampilkan sebagai kartu-kartu elegan ala dashboard wedding (lihat referensi: countdown ring, kartu budget, kartu tamu, kartu vendor). Semua angka harus update otomatis saat data modul lain berubah.
```
**Tes:** angka berubah saat kamu isi data di modul lain.

---

## MODUL 3 — Kartu Vendor reusable + Modul Acara

```
Bangun MODUL 3 (inti):

A. Komponen reusable <VendorItemCard> untuk tabel vendor_items, dengan field:
   title, status (selesai/ragu/belum_selesai/sudah_survey/belum_survey), vendor_name,
   vendor_status (prospect/survey/quotation/negotiation/booked/paid/completed), pic (pria/wanita/lainnya),
   budget_estimate, budget_actual (tampilkan budget_difference & remaining_payment yang dihitung DB),
   dp, paid_amount, is_paid_off, due_date, deadline, reference_links[], notes,
   dan area foto (vendor_photos) + field khusus per kategori via JSONB "details".
   Sediakan tambah/edit/hapus.

B. Modul Acara (events): user bisa buat event (Lamaran/Akad/Resepsi/custom) dengan
   name, event_date, time_start, time_end, location_name, maps_link, address, indoor_outdoor, notes.
   Di dalam tiap event, tampilkan daftar vendor_items DIKELOMPOKKAN per kategori:
   venue, attire, cincin, dekorasi, catering, dokumentasi, souvenir, transportasi, mua, mc,
   florist, music, mahar, seserahan, buku_tamu_undangan, lainnya.
   User bisa menambah item ke kategori mana pun (pakai <VendorItemCard>).

Untuk field "details" per kategori, sediakan field tambahan yang relevan, contoh:
   catering → menu[], porsi_disediakan, porsi_terpakai, food_testing
   attire → warna, style, jadwal_fitting, status_fitting
   dekorasi → tema, detail[] (Pelaminan/Backdrop/dll)
   seserahan → kategori, barang
```
**Tes:** tambah item di beberapa kategori; budget_difference & remaining_payment terhitung benar; data muncul di Budget & Dashboard.

---

## MODUL 4 — Budget

```
Bangun MODUL 4 (Budget) — DITURUNKAN dari vendor_items (jangan bikin tabel baru):

- Daftar per kategori: total estimasi vs aktual vs selisih, status bayar (dp/paid_amount/sisa).
- Total keseluruhan: total budget (weddings.total_budget) vs total aktual vs sisa.
- Visualisasi alokasi (ring atau bar per kategori).
- Filter/urut per kategori.

Angka harus konsisten dengan Dashboard.
```
**Tes:** cocok dengan dashboard; ubah budget item → semua ikut berubah.

---

## MODUL 5 — Checklist & Timeline 12 Bulan

```
Bangun MODUL 5 (Timeline checklist) memakai tabel checklist_items.

Saat wedding pertama dibuat, SEED checklist default berikut (phase → items). Kalau sudah ada, jangan seed ulang:

12_9_bulan: Tentukan tanggal pernikahan; Tentukan budget; Booking venue; Booking WO; Booking vendor utama (MUA, Dekorasi, Dokumentasi, Catering, MC); Susun guest list sementara; Tentukan konsep & tema acara.
8_6_bulan: Tentukan adat & rangkaian acara; Foto prewedding; Mulai fitting busana; Booking entertainment/music; Mulai konsep undangan; Tentukan bridesmaid & groomsmen.
5_4_bulan: Finalisasi vendor tambahan; Food testing catering; Survey venue bersama WO; Mulai urus administrasi pernikahan; Tentukan souvenir; Persiapan mahar & seserahan.
3_2_bulan: Cetak & sebar undangan; Tentukan rundown acara; Meeting vendor bersama WO; Konfirmasi jumlah tamu sementara; Mulai treatment rutin & jaga kesehatan.
1_bulan: Final fitting busana; Final meeting seluruh vendor; Finalisasi layout & denah tamu; Bridal party (opsional); Final detail (list lagu, cue card, properti acara).
1_minggu: Briefing keluarga; Pelunasan vendor; Gladi bersih; Kirim reminder tamu; Packing kebutuhan akad & resepsi; Beauty treatment terakhir; Istirahat cukup.

Fitur: ceklis item (is_done), tambah item sendiri, kelompok per fase, progress % update ke Dashboard.
```
**Tes:** centang item → progress dashboard naik; bisa tambah item sendiri.

---

## MODUL 6 — Tamu + RSVP

```
Bangun MODUL 6 (Tamu) memakai tabel guests:
- Tambah/edit/hapus tamu: name, phone, gender (P/W), category (keluarga_pria/keluarga_wanita/teman_pria/teman_wanita/rekan_kerja/vip/vendor), companions_count, invite_type (online/fisik), rsvp_status (belum_dikirim/terkirim/dibuka/hadir/tidak_hadir/pending), event_id (opsional), notes.
- Rekap di atas: total tamu, total dengan pendamping, jumlah per status RSVP.
- Pencarian & filter per kategori/status.
```
**Tes:** rekap benar; angka tamu di Dashboard ikut update.

---

## MODUL 7 — Rundown Acara

```
Bangun MODUL 7 (Rundown) memakai tabel rundown_items, per event:
- Field: time_start, time_end, activity_name (dropdown opsi umum + custom: Kedatangan Keluarga, Registrasi Tamu, Pembukaan, Sambutan, Tukar Cincin, Pembacaan Doa, Foto Bersama, Makan Bersama, Penutupan, dll), pic, location, duration_minutes, status (belum_dimulai/sedang_berlangsung/selesai/ditunda/dibatalkan), notes, link.
- Tampilan tabel/timeline urut waktu; bisa urutkan (sort_order); tambah/edit/hapus.
```
**Tes:** urutan tersimpan; ganti status berfungsi.

---

## MODUL 8 — Dokumen KUA + Upload Foto

```
Bangun MODUL 8 (Dokumen KUA) memakai tabel documents. Saat wedding dibuat, SEED daftar dokumen standar berikut (status default 'belum'):

Surat Pengantar Nikah dari Desa/Kelurahan (N1); Surat Keterangan Untuk Nikah; Surat Keterangan Asal Usul; Surat Persetujuan Mempelai; Surat Keterangan Tentang Orang Tua; Surat Izin Orang Tua (jika usia < 21 th); Fotokopi KTP CPW; Fotokopi KTP CPP; Fotokopi KTP Saksi; Fotokopi KTP Orang Tua; Fotokopi Kartu Keluarga; Fotokopi Akta Lahir; Surat Keterangan Sehat / Imunisasi Calon Istri; Surat Pernyataan Belum Pernah Kawin dari Desa/Kelurahan; Pas Foto Background Biru 2x3 (5 lembar); Pas Foto Background Biru 3x5 (5 lembar).

Fitur: status sudah/belum, owner (groom/bride/saksi/orangtua/bersama), due_date, upload scan (file_url), notes, progress %.

Juga implementasikan UPLOAD FOTO ke Supabase Storage bucket "wedding-photos":
- Path upload: "{user_id}/{wedding_id}/{nama_file}".
- Simpan referensi ke vendor_photos (untuk foto di VendorItemCard) atau ke documents.file_url (untuk scan dokumen).
- Gunakan bucket privat + signed URL untuk menampilkan.
```
**Tes:** centang dokumen; upload scan & foto; login akun lain → tidak bisa lihat foto akun pertama (uji RLS storage).

---

## MODUL 9 — Seserahan, Mahar, Bridesmaid & Groomsmen

```
Bangun MODUL 9:
- Seserahan & Mahar: gunakan vendor_items kategori 'seserahan' dan 'mahar', dengan field "details" relevan (seserahan: kategori barang seperti Perhiasan/Tas/Sepatu/Makeup/Pakaian/Mukena/dll + barang; mahar: barang). Tetap pakai <VendorItemCard>.
- Bridesmaid & Groomsmen: tabel party_members (party: bridesmaid/groomsmen; name, contact, clothing_size, role: pendamping/koordinator_tamu/dokumentasi/lainnya, notes). Tampilkan dua daftar terpisah + rekap jumlah.
```
**Tes:** CRUD lancar untuk ketiganya.

---

## MODUL 10 — Honeymoon + Gift/Angpao

```
Bangun MODUL 10:
- Honeymoon (tabel honeymoon): destination, departure_date, return_date, hotel, ticket_info, budget_transport, budget_hotel, budget_activities, notes. Tampilkan total budget honeymoon.
- Gift/Angpao (tabel gifts): dua mode via kolom type — 'registry' (giver_name, gift_type, gift_value) dan 'cash' (giver_name, amount, payment_method). Rekap: total nilai hadiah + total cash.
```
**Tes:** CRUD lancar; rekap nilai benar.

---

## MODUL 11 — Reminder + Fitur Pintar (lokal, tanpa server)

```
Bangun MODUL 11:
1. Reminder (tabel reminders): title, remind_at, type (payment/ring/guest_final/catering_final/rundown_final/custom), is_done. Tampilkan daftar reminder mendatang.
2. Tombol "Export ke Kalender (.ics)" untuk deadline & reminder penting — generate file .ics di sisi client (tanpa server) yang bisa diimpor ke Google Calendar.
3. Notifikasi lokal PWA (Notification API) untuk reminder bila diizinkan.
4. "Auto Budget Allocator" (rule-based, jalan di client): user input total budget + jumlah tamu → app sarankan alokasi per kategori (mis. venue+catering ~50%, dekor ~15%, dokumentasi ~10%, attire+MUA ~10%, lainnya ~15%) yang bisa diedit & disimpan sebagai vendor_items.
```
**Tes:** .ics ter-download & terbaca di Google Calendar; allocator menghasilkan angka wajar.

---

## PROMPT PENUTUP — Polish, Uji & Deploy

```
Finalisasi sebelum rilis:
1. Audit konsistensi UI semua modul (font, warna, spacing, empty state ramah ala "Belum ada vendor — yuk tambahkan yang pertama").
2. Pastikan setiap insert menyertakan user_id & wedding_id; uji RLS (skenario 2 akun, tidak boleh saling lihat data).
3. Pastikan PWA installable & ada ikon/splash; cek di HP (Android & iPhone) dan desktop.
4. Tambahkan halaman Kebijakan Privasi + checkbox persetujuan saat daftar.
5. Siapkan konfigurasi deploy untuk Cloudflare Pages (bukan Vercel), termasuk cara set environment variable VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di Cloudflare. Beri saya langkah-langkah deploy-nya.
```
**Tes akhir:** semua modul jalan, RLS aman, PWA terinstall, alur aktivasi `is_active` benar → beta ke beberapa pasangan → perbaiki → jual.

---

## Tips memakai prompt ini
- **Satu prompt = satu modul.** Selesaikan & tes sebelum lanjut.
- Kalau ada error, balas ke Claude Code: *"Ada error ini: [tempel pesan error]. Perbaiki."* — jangan lanjut modul baru sebelum yang ini beres.
- `git commit` tiap modul selesai (mis. "Modul 3: vendor card + events"). Kalau ada yang rusak, mudah kembali.
- Kalau suatu modul terlalu besar, minta pecah: *"Kerjakan bagian A dulu, nanti B menyusul."*

🌸
