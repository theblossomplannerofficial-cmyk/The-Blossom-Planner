// Konfigurasi sederhana tingkat app.
// Nomor WhatsApp admin untuk aktivasi akun (format internasional tanpa "+", mis. 62812xxxx).
// Ganti dengan nomor asli kamu sebelum rilis.
export const WHATSAPP_ADMIN = '6285643385045'

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_ADMIN}?text=${encodeURIComponent(message)}`
}
