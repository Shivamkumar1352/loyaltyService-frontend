import { useEffect } from 'react'
import { Check } from 'lucide-react'
import clsx from 'clsx'

type Props = {
  open: boolean
  title?: string
  subtitle?: string
  amountText?: string
  onClose: () => void
  primaryLabel?: string
}

export default function PaymentSuccessOverlay({
  open,
  title = 'Payment Successful',
  subtitle,
  amountText,
  onClose,
  primaryLabel = 'Done',
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.18), transparent 45%), linear-gradient(135deg, #042a1d 0%, #097349 40%, #3bcf88 100%)' }}
      />

      {/* Confetti dots */}
      <div className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.8) 1px, transparent 1px), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.7) 1px, transparent 1px), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-md text-center text-white">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/15 shadow-2xl backdrop-blur sm:h-24 sm:w-24 sm:rounded-[28px]">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 animate-pop sm:h-16 sm:w-16">
              <Check size={30} className="text-white sm:hidden" />
              <Check size={34} className="hidden text-white sm:block" />
            </div>
            <div className="absolute -inset-3 rounded-full border border-white/30 animate-ring" />
            <div className="absolute -inset-6 rounded-full border border-white/15 animate-ring2" />
          </div>
        </div>

        <h2 className="mt-6 text-xl font-black tracking-tight sm:text-2xl">{title}</h2>
        {amountText && (
          <p className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{amountText}</p>
        )}
        {subtitle && (
          <p className="mt-2 text-sm text-white/80">{subtitle}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className={clsx(
            'mt-8 w-full py-3 rounded-2xl font-black text-sm',
            'bg-white text-emerald-800 hover:bg-white/90 active:scale-[0.99] transition'
          )}
        >
          {primaryLabel}
        </button>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          55% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ring {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ring2 {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        .animate-pop { animation: pop 420ms cubic-bezier(.2,.9,.2,1) both; }
        .animate-ring { animation: ring 900ms cubic-bezier(.2,.9,.2,1) both; }
        .animate-ring2 { animation: ring2 1100ms cubic-bezier(.2,.9,.2,1) both; }
      `}</style>
    </div>
  )
}
