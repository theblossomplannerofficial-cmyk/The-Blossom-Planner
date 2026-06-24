// Tipe baris database yang relevan untuk Modul 0.
// Mengikuti skema di docs/Blossom-Schema.sql (tabel public.profiles).
// Tabel lain ditambahkan saat modulnya dibangun.

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  is_active: boolean
  expires_at: string | null // timestamptz (ISO string)
  products: string[]
  created_at: string
  updated_at: string
}

export interface Wedding {
  id: string
  user_id: string
  groom_name: string | null
  bride_name: string | null
  groom_nickname: string | null
  bride_nickname: string | null
  date_engagement: string | null // date (YYYY-MM-DD)
  date_akad: string | null
  date_resepsi: string | null
  total_budget: number | null
  cover_photo_url: string | null
  created_at: string
  updated_at: string
}

// Payload untuk membuat / memperbarui wedding (kolom yang diisi user).
export type WeddingInput = Pick<
  Wedding,
  | 'groom_name'
  | 'bride_name'
  | 'groom_nickname'
  | 'bride_nickname'
  | 'date_engagement'
  | 'date_akad'
  | 'date_resepsi'
  | 'total_budget'
>

export interface CoupleProfile {
  id: string
  wedding_id: string
  user_id: string
  role: string // 'groom' | 'bride'
  full_name: string | null
  nickname: string | null
  birth_place: string | null
  birth_date: string | null
  religion: string | null
  education: string | null
  occupation: string | null
  address: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type CoupleProfileInput = Pick<
  CoupleProfile,
  | 'full_name'
  | 'nickname'
  | 'birth_place'
  | 'birth_date'
  | 'religion'
  | 'education'
  | 'occupation'
  | 'address'
  | 'phone'
  | 'email'
>

export interface Parent {
  id: string
  wedding_id: string
  user_id: string
  side: string // 'groom' | 'bride'
  father_name: string | null
  mother_name: string | null
  address: string | null
  contact: string | null
  created_at: string
  updated_at: string
}

export type ParentInput = Pick<Parent, 'father_name' | 'mother_name' | 'address' | 'contact'>

export interface WeddingEvent {
  id: string
  wedding_id: string
  user_id: string
  name: string
  event_date: string | null
  time_start: string | null
  time_end: string | null
  location_name: string | null
  maps_link: string | null
  address: string | null
  indoor_outdoor: string | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type WeddingEventInput = Pick<
  WeddingEvent,
  | 'name'
  | 'event_date'
  | 'time_start'
  | 'time_end'
  | 'location_name'
  | 'maps_link'
  | 'address'
  | 'indoor_outdoor'
  | 'notes'
>

export interface Reminder {
  id: string
  wedding_id: string
  user_id: string
  title: string
  remind_at: string | null
  type: string | null
  related_item_id: string | null
  is_done: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export type ReminderInput = Pick<
  Reminder,
  'title' | 'remind_at' | 'type' | 'is_done' | 'notes'
>

export interface Honeymoon {
  id: string
  wedding_id: string
  user_id: string
  destination: string | null
  departure_date: string | null
  return_date: string | null
  hotel: string | null
  ticket_info: string | null
  budget_transport: number | null
  budget_hotel: number | null
  budget_activities: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type HoneymoonInput = Pick<
  Honeymoon,
  | 'destination'
  | 'departure_date'
  | 'return_date'
  | 'hotel'
  | 'ticket_info'
  | 'budget_transport'
  | 'budget_hotel'
  | 'budget_activities'
  | 'notes'
>

export interface Gift {
  id: string
  wedding_id: string
  user_id: string
  type: string // 'registry' | 'cash'
  giver_name: string | null
  gift_type: string | null
  gift_value: number | null
  amount: number | null
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type GiftInput = Pick<
  Gift,
  'type' | 'giver_name' | 'gift_type' | 'gift_value' | 'amount' | 'payment_method' | 'notes'
>

export interface PartyMember {
  id: string
  wedding_id: string
  user_id: string
  party: string | null // 'bridesmaid' | 'groomsmen'
  name: string
  contact: string | null
  clothing_size: string | null
  role: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type PartyMemberInput = Pick<
  PartyMember,
  'party' | 'name' | 'contact' | 'clothing_size' | 'role' | 'notes'
>

export interface WeddingDocument {
  id: string
  wedding_id: string
  user_id: string
  name: string
  owner: string | null
  status: string | null // 'sudah' | 'belum'
  due_date: string | null
  file_url: string | null // menyimpan PATH storage (bukan URL publik)
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface VendorPhoto {
  id: string
  vendor_item_id: string
  wedding_id: string
  user_id: string
  photo_url: string // menyimpan PATH storage
  caption: string | null
  created_at: string
}

export interface RundownItem {
  id: string
  wedding_id: string
  user_id: string
  event_id: string | null
  time_start: string | null
  time_end: string | null
  activity_name: string
  pic: string | null
  location: string | null
  duration_minutes: number | null
  status: string | null
  notes: string | null
  link: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type RundownItemInput = Pick<
  RundownItem,
  | 'event_id'
  | 'time_start'
  | 'time_end'
  | 'activity_name'
  | 'pic'
  | 'location'
  | 'duration_minutes'
  | 'status'
  | 'notes'
  | 'link'
  | 'sort_order'
>

export interface Guest {
  id: string
  wedding_id: string
  user_id: string
  event_id: string | null
  name: string
  phone: string | null
  gender: string | null
  category: string | null
  companions_count: number
  invite_type: string | null
  rsvp_status: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type GuestInput = Pick<
  Guest,
  | 'event_id'
  | 'name'
  | 'phone'
  | 'gender'
  | 'category'
  | 'companions_count'
  | 'invite_type'
  | 'rsvp_status'
  | 'notes'
>

export interface ChecklistItem {
  id: string
  wedding_id: string
  user_id: string
  phase: string | null
  title: string
  is_done: boolean
  due_date: string | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface VendorItem {
  id: string
  wedding_id: string
  user_id: string
  event_id: string | null
  category: string
  title: string | null
  status: string | null
  vendor_name: string | null
  vendor_status: string | null
  pic: string | null
  budget_estimate: number | null
  budget_actual: number | null
  budget_difference: number | null // generated column (estimate - actual)
  dp: number | null
  paid_amount: number | null
  remaining_payment: number | null // generated column (actual - paid)
  is_paid_off: boolean | null
  due_date: string | null
  deadline: string | null
  reference_links: string[] | null
  details: Record<string, unknown> | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Kolom yang boleh diisi user (generated columns dikecualikan).
export type VendorItemInput = Pick<
  VendorItem,
  | 'event_id'
  | 'category'
  | 'title'
  | 'status'
  | 'vendor_name'
  | 'vendor_status'
  | 'pic'
  | 'budget_estimate'
  | 'budget_actual'
  | 'dp'
  | 'paid_amount'
  | 'is_paid_off'
  | 'due_date'
  | 'deadline'
  | 'reference_links'
  | 'details'
  | 'notes'
>
