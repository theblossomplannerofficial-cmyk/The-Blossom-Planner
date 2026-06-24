export default function Loading({ label = 'Memuat…' }: { label?: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-cream">
      <span
        className="h-10 w-10 animate-spin rounded-full border-2 border-burgundy-mid/25 border-t-burgundy-deep"
        aria-hidden
      />
      <p className="font-body text-sm text-ink/60">{label}</p>
    </div>
  )
}
