import { useEffect, useState } from 'react'
import { walletAPI, rewardsAPI } from '../../core/api'
import { useAuthStore } from '../../store'
import { BalanceCard } from './components/BalanceCard'
import { DashboardHeader } from './components/DashboardHeader'
import { QuickActions } from './components/QuickActions'
import { RecentTransactions } from './components/RecentTransactions'
import { RewardsSummary } from './components/RewardsSummary'
import type { DashboardBalance, DashboardRewards, DashboardTransaction } from './types'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [balance, setBalance] = useState<DashboardBalance | null>(null)
  const [rewards, setRewards] = useState<DashboardRewards | null>(null)
  const [txns, setTxns] = useState<DashboardTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [balanceVisible, setBalanceVisible] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [b, r, t] = await Promise.allSettled([
        walletAPI.getBalance(),
        rewardsAPI.getSummary(),
        walletAPI.getTransactions(0, 5),
      ])
      if (b.status === 'fulfilled') setBalance(b.value.data?.data)
      if (r.status === 'fulfilled') setRewards(r.value.data?.data)
      if (t.status === 'fulfilled') setTxns(t.value.data?.content || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-slide-up">
      <DashboardHeader user={user} loading={loading} onRefresh={load} />
      <BalanceCard
        balance={balance}
        loading={loading}
        balanceVisible={balanceVisible}
        onToggleVisibility={() => setBalanceVisible((current) => !current)}
      />
      <QuickActions />
      <RewardsSummary rewards={rewards} loading={loading} />
      <RecentTransactions transactions={txns} loading={loading} />
    </div>
  )
}
