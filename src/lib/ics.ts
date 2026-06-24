// Generator file .ics (iCalendar) sederhana untuk diimpor ke Google Calendar dll.

export interface IcsEvent {
  uid: string
  title: string
  start: Date
  durationMinutes?: number
  description?: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Format ke waktu UTC: YYYYMMDDTHHMMSSZ */
function toIcsUtc(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  )
}

function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function buildIcs(events: IcsEvent[]): string {
  const now = toIcsUtc(new Date())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Blossom Wedding Planner//ID',
    'CALSCALE:GREGORIAN',
  ]
  for (const ev of events) {
    const end = new Date(ev.start.getTime() + (ev.durationMinutes ?? 30) * 60_000)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.uid}@blossom`,
      `DTSTAMP:${now}`,
      `DTSTART:${toIcsUtc(ev.start)}`,
      `DTEND:${toIcsUtc(end)}`,
      `SUMMARY:${escapeText(ev.title)}`,
      ...(ev.description ? [`DESCRIPTION:${escapeText(ev.description)}`] : []),
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

/** Trigger unduhan file .ics di browser. */
export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
