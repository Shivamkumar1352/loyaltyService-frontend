import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'

const DEFAULT_DURATION_MS = 2500

type Props = {
  open: boolean
  title?: string
  subtitle?: string
  amountText?: string
  /** Called automatically after the animation duration (no button). */
  onClose: () => void
  /** How long the overlay stays visible (default ~2.5s). */
  durationMs?: number
}

export default function PaymentSuccessOverlay({
  open,
  title = 'Success',
  subtitle,
  amountText,
  onClose,
  durationMs = DEFAULT_DURATION_MS,
}: Props) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      onCloseRef.current()
    }, durationMs)
    return () => window.clearTimeout(id)
  }, [open, durationMs])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 pointer-events-none animate-success-fade-in"
      aria-live="polite"
    >
      {/* Translucent green full-screen panel */}
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{
          background:
            'linear-gradient(160deg, rgba(16, 185, 129, 0.42) 0%, rgba(5, 150, 105, 0.38) 45%, rgba(4, 120, 87, 0.44) 100%)',
        }}
      />

      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.55) 1px, transparent 1px), radial-gradient(circle at 78% 32%, rgba(255,255,255,0.45) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md text-center text-white px-4">
        <div className="mx-auto w-20 h-20 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/25">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-white/25 flex items-center justify-center animate-success-pop">
              <Check size={30} className="text-white drop-shadow-sm" strokeWidth={2.5} />
            </div>
            <div className="absolute -inset-2 rounded-full border border-white/35 animate-success-ring" />
          </div>
        </div>

        <h2 className="mt-5 text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">{title}</h2>
        {amountText && (
          <p className="mt-2 text-3xl sm:text-4xl font-black tracking-tight tabular-nums drop-shadow-sm">
            {amountText}
          </p>
        )}
        {subtitle && (
          <p className="mt-2 text-sm text-white/90 drop-shadow-sm">{subtitle}</p>
        )}
      </div>

      <style>{`
        @keyframes success-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes success-pop {
          0% { transform: scale(0.75); opacity: 0.85; }
          60% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes success-ring {
          0% { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-success-fade-in { animation: success-fade-in 280ms ease-out both; }
        .animate-success-pop { animation: success-pop 500ms cubic-bezier(.2,.9,.2,1) both; }
        .animate-success-ring { animation: success-ring 700ms cubic-bezier(.2,.9,.2,1) both; }
      `}</style>
    </div>
  )
}
