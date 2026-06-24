/**
 * Brand / logo Blossom.
 *  - variant "full" : logo lockup lengkap (Wedding Planner Logo) — dipakai di layar Login.
 *  - variant "mark" : monogram + wordmark teks — dipakai di layar gating (menunggu/expired).
 */
export default function Brand({
  variant = 'mark',
  size = 'lg',
}: {
  variant?: 'full' | 'mark'
  size?: 'sm' | 'lg'
}) {
  if (variant === 'full') {
    const w = size === 'lg' ? 'w-64' : 'w-44'
    return (
      <div className="flex justify-center">
        <img
          src="/logo-full.png"
          alt="Blossom Planner — Wedding & Event Planning"
          className={`${w} rounded-3xl shadow-md ring-1 ring-burgundy-deep/10`}
        />
      </div>
    )
  }

  const logoSize = size === 'lg' ? 'h-24 w-24' : 'h-12 w-12'
  const script = size === 'lg' ? 'text-5xl' : 'text-3xl'
  const sub = size === 'lg' ? 'text-sm' : 'text-xs'

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <img src="/logo.png" alt="Blossom" className={`${logoSize} object-contain`} />
      <h1 className={`font-script ${script} leading-none text-burgundy-deep`}>
        Blossom
      </h1>
      <p className={`font-body ${sub} uppercase tracking-[0.3em] text-gold-warm`}>
        Wedding Planner
      </p>
    </div>
  )
}
