import React from 'react'
import { ArrowLeft, Gift, Plus, ArrowUp, Clock } from 'lucide-react'
import { useBooking, type ActivityItem } from '../context/BookingContext'
import { StatusBar } from '../components/ui/StatusBar'
import { Card } from '../components/ui/Card'

interface WalletScreenProps {
  onBack?: () => void
  onRedeemGift?: () => void
  onAddPromo?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function WalletScreen({ onBack, onRedeemGift, onAddPromo, showToast }: WalletScreenProps) {
  const { giftBalance = 0, activities } = useBooking()

  // Reuse or extend activities: filter promo (and any with explicit amount meta) as credit transactions
  // These are already populated on gift/promo redemptions via GiftCodePage + handleGiftRedeem
  const creditTransactions = React.useMemo(() => {
    return (activities || [])
      .filter((a: ActivityItem) => a.type === 'promo' || (a.meta && typeof a.meta.amount === 'number'))
      .slice(0, 8)
  }, [activities])

  const handleRedeem = () => {
    if (onRedeemGift) {
      onRedeemGift()
    } else {
      showToast?.('Opening gift code redemption...', 'info')
    }
  }

  const handleAddPromo = () => {
    if (onAddPromo) {
      onAddPromo()
    } else {
      showToast?.('Promo code entry opened (demo)', 'info')
    }
  }

  return (
    <div className="screen bg-[#f8fafc] flex flex-col">
      <StatusBar variant="light" />

      {/* Header matching Profile/Notifications/RideHistory light patterns */}
      <div className="px-5 pt-3 pb-4 flex items-center gap-3 border-b border-gray-100 bg-white">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center active:bg-gray-100 flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[21px] tracking-[-0.3px]">Wallet</div>
          <div className="text-xs text-gray-500 -mt-0.5">Credits, gifts &amp; promos</div>
        </div>
        {giftBalance > 0 && (
          <div className="text-right">
            <div className="text-[10px] text-gray-500">Available</div>
            <div className="text-sm font-semibold text-emerald-600 tabular-nums">${giftBalance}</div>
          </div>
        )}
      </div>

      {/* Prominent Gift Balance (high-fidelity, light friendly, updates live from BookingContext) */}
      <div className="px-4 pt-5">
        <Card variant="elevated" padding="lg" className="bg-white border-[#e0e7ff] shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="uppercase tracking-[1.5px] text-[11px] font-semibold text-gray-500">CURRENT GIFT BALANCE</div>
              <div className="mt-2 text-[48px] leading-[48px] font-semibold tabular-nums text-[#1c1f2a]">
                ${giftBalance}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Ready for your next ride
              </div>
            </div>
            <div className="text-[56px] leading-none mt-1 opacity-90 select-none">🎁</div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
            Credits automatically apply at checkout for eligible trips.
          </div>
        </Card>
      </div>

      {/* Quick Actions - Redeem gift code, Add promo (task requirement) */}
      <div className="px-4 pt-5">
        <div className="px-1 text-[10px] uppercase tracking-[1.5px] font-semibold text-gray-500 mb-2.5">QUICK ACTIONS</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRedeem}
            className="group flex flex-col items-center justify-center gap-2.5 py-4 px-3 rounded-2xl bg-white border border-gray-100 active:bg-amber-50 active:border-amber-200 transition-all active:scale-[0.985]"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center group-active:bg-amber-200">
              <Gift size={21} className="text-amber-600" />
            </div>
            <div>
              <div className="font-semibold text-[14px] text-[#1c1f2a]">Redeem gift code</div>
              <div className="text-[10px] text-gray-500">Add balance instantly</div>
            </div>
          </button>

          <button
            onClick={handleAddPromo}
            className="group flex flex-col items-center justify-center gap-2.5 py-4 px-3 rounded-2xl bg-white border border-gray-100 active:bg-[#f0f4ff] active:border-[#4c5df9]/30 transition-all active:scale-[0.985]"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#eef3ff] flex items-center justify-center group-active:bg-[#dbe6ff]">
              <Plus size={21} className="text-[#4c5df9]" />
            </div>
            <div>
              <div className="font-semibold text-[14px] text-[#1c1f2a]">Add promo</div>
              <div className="text-[10px] text-gray-500">Enter code manually</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent credit transactions (reuse/extend activities from context) */}
      <div className="px-4 pt-5 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="text-[10px] uppercase tracking-[1.5px] font-semibold text-gray-500">RECENT CREDIT TRANSACTIONS</div>
          <div className="text-[10px] text-gray-400 tabular-nums">{creditTransactions.length} total</div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pb-6 -mx-0.5 px-0.5">
          {creditTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl border border-gray-100">
              <Clock size={32} className="text-gray-300 mb-3" />
              <div className="font-medium text-sm text-[#1c1f2a]">No credit activity yet</div>
              <p className="text-xs text-gray-500 mt-1 max-w-[210px]">Redeem a gift code or promo above — transactions will appear here and in Activity Center.</p>
            </div>
          ) : (
            creditTransactions.map((tx) => {
              const amt = typeof tx.meta?.amount === 'number' ? tx.meta.amount : undefined
              const isCredit = !!amt
              return (
                <Card key={tx.id} padding="md" className="border border-gray-100 active:bg-gray-50 transition">
                  <div className="flex gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {isCredit ? (
                        <ArrowUp size={17} className="text-emerald-600" />
                      ) : (
                        <Gift size={17} className="text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-px">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="font-semibold text-[14.5px] text-[#1c1f2a] tracking-[-0.1px] leading-tight">{tx.title}</div>
                        {isCredit && (
                          <div className="font-semibold text-emerald-600 text-sm tabular-nums flex-shrink-0">+${amt}</div>
                        )}
                      </div>
                      <div className="text-xs leading-snug text-gray-600 mt-0.5 pr-1 line-clamp-2">{tx.description}</div>
                      <div className="mt-1.5 text-[10px] text-gray-400">{tx.time}</div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      <div className="text-center pb-5 text-[10px] text-gray-400 px-4">
        Your gift balance and promo credits are managed here. See full history in Notifications.
      </div>
    </div>
  )
}
