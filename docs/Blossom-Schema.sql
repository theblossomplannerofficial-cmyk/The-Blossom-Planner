-- ============================================================
-- BLOSSOM WEDDING PLANNER — SKEMA DATABASE LENGKAP (Supabase / Postgres)
-- ============================================================
-- Cara pakai:
--   1. Buka project Supabase > SQL Editor > New query
--   2. Tempel SELURUH file ini > Run
--   3. Jalankan pada PROJECT BARU (kosong). Untuk menjalankan ulang,
--      reset/drop dulu tabel terkait agar tidak bentrok.
--
-- Prinsip desain:
--   - Setiap tabel punya kolom user_id => RLS sederhana: auth.uid() = user_id
--   - "vendor_items" = SATU tabel reusable untuk SEMUA kategori vendor
--     (venue, catering, dekorasi, MUA, dst.) — kolom umum + JSONB "details"
--     untuk field khusus per kategori. Ini menghindari 25 tabel terpisah.
--   - Budget = diturunkan dari vendor_items (bukan tabel terpisah).
--   - Gating is_active dilakukan di level APP (layar "menunggu aktivasi"),
--     bukan di RLS, agar policy tetap sederhana.
-- ============================================================


-- ============================================================
-- 0. FUNGSI BANTU
-- ============================================================

-- Auto-update kolom updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================================
-- 1. PROFILES (perpanjangan dari auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  is_active   boolean not null default false,        -- diaktifkan setelah bayar via WA
  expires_at  timestamptz,                           -- opsional: akses time-boxed (mis. 12 bln)
  products    text[] not null default '{wedding}',   -- produk yang dimiliki user (untuk multi-app nanti)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Saat user baru daftar di Auth, otomatis buat baris profil (is_active = false)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 2. WEDDINGS (kontainer utama per user)
-- ============================================================
create table if not exists public.weddings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  groom_name      text,
  bride_name      text,
  groom_nickname  text,
  bride_nickname  text,
  date_engagement date,
  date_akad       date,
  date_resepsi    date,
  total_budget    numeric(14,2) default 0,
  cover_photo_url text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ============================================================
-- 3. DATA MEMPELAI & ORANG TUA (opsional, dipakai kalau perlu)
-- ============================================================
create table if not exists public.couple_profiles (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references public.weddings(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null,            -- 'groom' | 'bride'
  full_name   text,
  nickname    text,
  birth_place text,
  birth_date  date,
  religion    text,
  education   text,
  occupation  text,
  address     text,
  phone       text,
  email       text,
  photo_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.parents (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references public.weddings(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  side        text not null,            -- 'groom' | 'bride'
  father_name text,
  mother_name text,
  address     text,
  contact     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ============================================================
-- 4. EVENTS (Lamaran / Akad / Resepsi / lainnya)
-- ============================================================
create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  wedding_id     uuid not null references public.weddings(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,         -- 'Lamaran' | 'Akad' | 'Resepsi' | custom
  event_date     date,
  time_start     time,
  time_end       time,
  location_name  text,
  maps_link      text,
  address        text,
  indoor_outdoor text,                  -- 'indoor' | 'outdoor'
  notes          text,
  sort_order     int default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);


-- ============================================================
-- 5. VENDOR_ITEMS  ⭐ TABEL REUSABLE INTI ⭐
--    Dipakai untuk SEMUA kategori: venue, attire, cincin, dekorasi,
--    catering, dokumentasi, souvenir, transportasi, mua, mc, florist,
--    music, mahar, seserahan, buku_tamu_undangan, lainnya
-- ============================================================
create table if not exists public.vendor_items (
  id              uuid primary key default gen_random_uuid(),
  wedding_id      uuid not null references public.weddings(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  event_id        uuid references public.events(id) on delete set null,  -- nullable: item bisa level-wedding
  category        text not null,        -- 'venue','attire','cincin','dekorasi','catering','dokumentasi',
                                        -- 'souvenir','transportasi','mua','mc','florist','music',
                                        -- 'mahar','seserahan','buku_tamu_undangan','lainnya'
  title           text,                 -- nama item (mis. "Gaun CPW", "Catering Utama")
  status          text,                 -- 'selesai','ragu','belum_selesai','sudah_survey','belum_survey'
  vendor_name     text,
  vendor_status   text,                 -- 'prospect','survey','quotation','negotiation','booked','paid','completed'
  pic             text,                 -- 'pria','wanita','lainnya'
  budget_estimate numeric(14,2) default 0,
  budget_actual   numeric(14,2) default 0,
  budget_difference numeric(14,2)
    generated always as (coalesce(budget_estimate,0) - coalesce(budget_actual,0)) stored,
  dp              numeric(14,2) default 0,
  paid_amount     numeric(14,2) default 0,
  remaining_payment numeric(14,2)
    generated always as (coalesce(budget_actual,0) - coalesce(paid_amount,0)) stored,
  is_paid_off     boolean default false,
  due_date        date,                 -- jatuh tempo pembayaran
  deadline        date,                 -- deadline item
  reference_links text[],               -- link referensi
  details         jsonb default '{}'::jsonb,  -- field khusus per kategori (lihat catatan di bawah)
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
-- Contoh isi "details" (JSONB) per kategori:
--   catering : { "menu": [...], "porsi_disediakan": 300, "porsi_terpakai": 0, "food_testing": "..." }
--   attire   : { "warna": "Maroon", "style": "Traditional", "jadwal_fitting": "...", "status_fitting": "belum" }
--   dekorasi : { "tema": "Rustic", "detail": ["Pelaminan","Backdrop"] }
--   seserahan: { "kategori": "Perhiasan", "barang": "..." }
-- Frontend (Claude Code) yang menentukan field per kategori di dalam "details".


-- ============================================================
-- 6. VENDOR_PHOTOS (foto referensi per item)
-- ============================================================
create table if not exists public.vendor_photos (
  id              uuid primary key default gen_random_uuid(),
  vendor_item_id  uuid not null references public.vendor_items(id) on delete cascade,
  wedding_id      uuid not null references public.weddings(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  photo_url       text not null,        -- path di Supabase Storage / R2
  caption         text,
  created_at      timestamptz not null default now()
);


-- ============================================================
-- 7. DOCUMENTS (Checklist Dokumen KUA) — fitur khas Indonesia
-- ============================================================
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references public.weddings(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,            -- mis. "Surat N1", "Fotokopi KTP CPW"
  owner       text,                     -- 'groom','bride','saksi','orangtua','bersama'
  status      text default 'belum',     -- 'sudah' | 'belum'
  due_date    date,
  file_url    text,                     -- opsional: scan dokumen
  notes       text,
  sort_order  int default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ============================================================
-- 8. CHECKLIST_ITEMS (Timeline Persiapan 12 Bulan)
-- ============================================================
create table if not exists public.checklist_items (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references public.weddings(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  phase       text,    -- '12_9_bulan','8_6_bulan','5_4_bulan','3_2_bulan','1_bulan','1_minggu','custom'
  title       text not null,
  is_done     boolean default false,
  due_date    date,
  notes       text,
  sort_order  int default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- ============================================================
-- 9. RUNDOWN_ITEMS (Rundown Acara per event)
-- ============================================================
create table if not exists public.rundown_items (
  id               uuid primary key default gen_random_uuid(),
  wedding_id       uuid not null references public.weddings(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  event_id         uuid references public.events(id) on delete cascade,
  time_start       time,
  time_end         time,
  activity_name    text not null,
  pic              text,    -- Mempelai Pria/Wanita, MC, WO, dst.
  location         text,
  duration_minutes int,
  status           text default 'belum_dimulai', -- 'belum_dimulai','sedang_berlangsung','selesai','ditunda','dibatalkan'
  notes            text,
  link             text,
  sort_order       int default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);


-- ============================================================
-- 10. GUESTS (Daftar Tamu + RSVP)
-- ============================================================
create table if not exists public.guests (
  id              uuid primary key default gen_random_uuid(),
  wedding_id      uuid not null references public.weddings(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  event_id        uuid references public.events(id) on delete set null,  -- tamu bisa per event
  name            text not null,
  phone           text,
  gender          text,    -- 'P' | 'W'
  category        text,    -- 'keluarga_pria','keluarga_wanita','teman_pria','teman_wanita','rekan_kerja','vip','vendor'
  companions_count int default 0,
  invite_type     text,    -- 'online' | 'fisik'
  rsvp_status     text default 'belum_dikirim', -- 'belum_dikirim','terkirim','dibuka','hadir','tidak_hadir','pending'
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ============================================================
-- 11. PARTY_MEMBERS (Bridesmaid & Groomsmen)
-- ============================================================
create table if not exists public.party_members (
  id            uuid primary key default gen_random_uuid(),
  wedding_id    uuid not null references public.weddings(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  party         text,    -- 'bridesmaid' | 'groomsmen'
  name          text not null,
  contact       text,
  clothing_size text,
  role          text,    -- 'pendamping','koordinator_tamu','dokumentasi','lainnya'
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- ============================================================
-- 12. GIFTS (Wedding Gift Registry + Cash Gift / Angpao)
-- ============================================================
create table if not exists public.gifts (
  id             uuid primary key default gen_random_uuid(),
  wedding_id     uuid not null references public.weddings(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  type           text not null,        -- 'registry' | 'cash'
  giver_name     text,
  gift_type      text,                 -- untuk registry: jenis hadiah
  gift_value     numeric(14,2),
  amount         numeric(14,2),        -- untuk cash
  payment_method text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);


-- ============================================================
-- 13. HONEYMOON
-- ============================================================
create table if not exists public.honeymoon (
  id                uuid primary key default gen_random_uuid(),
  wedding_id        uuid not null references public.weddings(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  destination       text,
  departure_date    date,
  return_date       date,
  hotel             text,
  ticket_info       text,
  budget_transport  numeric(14,2) default 0,
  budget_hotel      numeric(14,2) default 0,
  budget_activities numeric(14,2) default 0,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);


-- ============================================================
-- 14. REMINDERS (Reminder & Automation — drive notifikasi lokal/.ics)
-- ============================================================
create table if not exists public.reminders (
  id              uuid primary key default gen_random_uuid(),
  wedding_id      uuid not null references public.weddings(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  remind_at       timestamptz,
  type            text,    -- 'payment','ring','guest_final','catering_final','rundown_final','custom'
  related_item_id uuid,    -- opsional: tautan ke vendor_items dll.
  is_done         boolean default false,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ============================================================
-- 15. TRIGGER updated_at UNTUK SEMUA TABEL
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','weddings','couple_profiles','parents','events','vendor_items',
    'documents','checklist_items','rundown_items','guests','party_members',
    'gifts','honeymoon','reminders'
  ]
  loop
    execute format('drop trigger if exists trg_%I_updated on public.%I;', t, t);
    execute format(
      'create trigger trg_%I_updated before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;
end $$;


-- ============================================================
-- 16. INDEXES (performa query per user/wedding)
-- ============================================================
create index if not exists idx_weddings_user        on public.weddings(user_id);
create index if not exists idx_couple_wedding        on public.couple_profiles(wedding_id);
create index if not exists idx_parents_wedding       on public.parents(wedding_id);
create index if not exists idx_events_wedding        on public.events(wedding_id);
create index if not exists idx_vendor_wedding        on public.vendor_items(wedding_id);
create index if not exists idx_vendor_event          on public.vendor_items(event_id);
create index if not exists idx_vendor_category       on public.vendor_items(category);
create index if not exists idx_vphotos_item          on public.vendor_photos(vendor_item_id);
create index if not exists idx_documents_wedding     on public.documents(wedding_id);
create index if not exists idx_checklist_wedding     on public.checklist_items(wedding_id);
create index if not exists idx_rundown_wedding       on public.rundown_items(wedding_id);
create index if not exists idx_guests_wedding        on public.guests(wedding_id);
create index if not exists idx_party_wedding         on public.party_members(wedding_id);
create index if not exists idx_gifts_wedding         on public.gifts(wedding_id);
create index if not exists idx_honeymoon_wedding     on public.honeymoon(wedding_id);
create index if not exists idx_reminders_wedding     on public.reminders(wedding_id);


-- ============================================================
-- 17. ROW LEVEL SECURITY (WAJIB)  🔒
--     Setiap user hanya bisa akses datanya sendiri: auth.uid() = user_id
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'weddings','couple_profiles','parents','events','vendor_items','vendor_photos',
    'documents','checklist_items','rundown_items','guests','party_members',
    'gifts','honeymoon','reminders'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "own_rows" on public.%I;', t);
    execute format(
      'create policy "own_rows" on public.%I
       for all
       using (auth.uid() = user_id)
       with check (auth.uid() = user_id);', t);
  end loop;
end $$;

-- Profiles: user hanya boleh lihat/ubah profilnya sendiri (tidak boleh ubah is_active sendiri idealnya —
-- pengaturan is_active dilakukan via dashboard admin/service role, bukan dari app pelanggan)
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);


-- ============================================================
-- 18. STORAGE (foto pernikahan) — jalankan setelah membuat bucket
-- ============================================================
-- Di dashboard: Storage > New bucket > nama "wedding-photos", PRIVATE (uncheck public).
-- Konvensi path upload: "{user_id}/{wedding_id}/{nama_file}"
-- Lalu jalankan policy berikut agar user hanya akses foldernya sendiri:

drop policy if exists "wedding_photos_own" on storage.objects;
create policy "wedding_photos_own" on storage.objects
  for all
  using (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'wedding-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- SELESAI. Skema siap. Langkah berikut: bangun frontend modul-per-modul
-- (lihat file "Blossom-Instruksi-Build-ClaudeCode.md").
-- ============================================================
