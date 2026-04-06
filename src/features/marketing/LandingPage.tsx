import { ArrowRight, BadgeIndianRupee, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const highlights = [
  { label: 'Instant transfers', value: '< 3 sec' },
  { label: 'Active rewards', value: '24/7' },
  { label: 'Trusted wallets', value: '50K+' },
]

const featureCards = [
  {
    icon: Zap,
    title: 'Fast wallet flows',
    copy: 'Move money, split bills, and top up balances without the usual banking friction.',
    delayClass: 'animation-delay-200',
  },
  {
    icon: ShieldCheck,
    title: 'Built for control',
    copy: 'Track every transfer, reward, and identity check from one clean dashboard.',
    delayClass: 'animation-delay-300',
  },
  {
    icon: Sparkles,
    title: 'Rewards that feel useful',
    copy: 'Get nudges, streaks, and cash-friendly perks designed around everyday spending.',
    delayClass: 'animation-delay-400',
  },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5efe2] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(22,179,110,0.24),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_#fbf7ef_0%,_#f3ede0_100%)]" />
      <div className="landing-grid absolute inset-0 opacity-40" />
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 pt-6 sm:px-8 lg:px-10">
        <header className="animate-fade-in flex items-center justify-between rounded-full border border-black/5 bg-white/65 px-4 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-[0_10px_30px_rgba(15,23,42,0.16)]">
              B
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-tight">Batua</p>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Smart Wallet</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition-colors hover:text-slate-950">Features</a>
            <a href="#security" className="transition-colors hover:text-slate-950">Security</a>
            <a href="#preview" className="transition-colors hover:text-slate-950">Preview</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost hidden rounded-full px-4 py-2 sm:inline-flex">
              Sign in
            </Link>
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5">
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <section className="max-w-2xl">
            <div className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <BadgeIndianRupee size={15} className="text-brand-700" />
              Wallet-first payments for modern India
            </div>

            <h1 className="animate-slide-up mt-6 text-5xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Money that moves with you, not against you.
            </h1>

            <p className="animate-slide-up animation-delay-200 mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Batua gives you one place to pay, transfer, track rewards, and stay in control with a wallet experience that feels sharp on day one.
            </p>

            <div className="animate-slide-up animation-delay-300 mt-8 flex flex-wrap items-center gap-4">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(22,179,110,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-500">
                Create your wallet
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-900 backdrop-blur transition duration-200 hover:border-slate-900/20 hover:bg-white">
                Existing user login
              </Link>
            </div>

            <div className="animate-slide-up animation-delay-500 mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-3xl border border-black/5 bg-white/70 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur">
                  <p className="text-2xl font-black tracking-tight text-slate-950">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="preview" className="relative animate-fade-in animation-delay-300">
            <div className="landing-float rounded-[2rem] border border-white/50 bg-white/70 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-6">
              <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Wallet balance</p>
                    <p className="mt-2 text-4xl font-black tracking-tight">₹84,250</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                    Batua
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/45">This week</p>
                    <p className="mt-2 text-2xl font-bold">+₹12,480</p>
                    <p className="mt-1 text-sm text-white/60">cash in and wallet top-ups</p>
                  </div>
                  <div className="rounded-3xl bg-emerald-400/12 p-4 ring-1 ring-emerald-300/20">
                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">Reward streak</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-300">16 days</p>
                    <p className="mt-1 text-sm text-white/60">unlocking higher cashback</p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    ['Rent split', '-₹8,000', '2 min ago'],
                    ['Salary credit', '+₹42,000', 'Today'],
                    ['Coffee rewards', '+180 pts', 'Yesterday'],
                  ].map(([title, amount, when]) => (
                    <div key={title} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/6 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="text-xs text-white/45">{when}</p>
                      </div>
                      <p className="text-sm font-semibold text-white/80">{amount}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3" id="features">
                {featureCards.map(({ icon: Icon, title, copy, delayClass }) => (
                  <article
                    key={title}
                    className={`animate-slide-up ${delayClass} rounded-[1.5rem] border border-black/5 bg-[#fffdf8] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <Icon size={18} />
                    </div>
                    <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>

        <section id="security" className="animate-fade-in animation-delay-500 grid gap-4 rounded-[2rem] border border-black/5 bg-white/60 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Why Batua</p>
            <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">A landing page that sells trust, speed, and daily utility.</p>
          </div>
          <div className="rounded-[1.5rem] bg-[#f8f4ea] p-5">
            <p className="text-sm font-semibold text-slate-900">Real-time transaction visibility</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Every payment flow is visible from the same dashboard you already use for wallet actions and analytics.</p>
          </div>
          <div className="rounded-[1.5rem] bg-[#eef8f1] p-5">
            <p className="text-sm font-semibold text-slate-900">Security-forward onboarding</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">OTP, KYC, and admin review workflows stay intact while the front door now feels product-grade.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
