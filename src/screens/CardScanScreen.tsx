
import { Info } from 'lucide-react'
import { StatusBar } from '../components/ui/StatusBar'
import { TopBar } from '../components/ui/TopBar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

interface CardScanScreenProps {
  onBack?: () => void
  variant?: 'dark' | 'light'
  showToast?: (message: string) => void
}

export function CardScanScreen({ onBack, variant = 'dark' }: CardScanScreenProps) {
  const isDark = variant === 'dark'
  const bg = isDark ? '#121826' : '#f8fafc'
  const text = isDark ? '#fff' : '#1c1f2a'

  return (
    <div className="screen flex flex-col" style={{ backgroundColor: bg, color: text }}>
      {/* StatusBar + TopBar */}
      <StatusBar variant={isDark ? 'dark' : 'light'} />
      <TopBar onBack={onBack} variant={isDark ? 'dark' : 'light'} title="Card Scan" />

      {/* Main scan area */}
      <div className="px-6 flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[327px] relative">
            {/* Scan frame */}
            <div 
              className="aspect-[16/10] rounded-3xl border-[3px] border-[#4c5df9] relative overflow-hidden flex items-center justify-center"
              style={{ background: isDark ? '#1e293b' : '#f1f5f9' }}
            >
              {/* Fake card inside frame */}
              <div className="w-[72%] h-[68%] rounded-2xl bg-gradient-to-br from-[#e2e8f0] to-white shadow-inner flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[11px] text-gray-400 tracking-widest">CARD NUMBER</div>
                  <div className="font-mono text-xl text-gray-700 mt-1">•••• •••• •••• 4523</div>
                </div>
              </div>

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-[#4c5df9]" />
              <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-[#4c5df9]" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-[#4c5df9]" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-[#4c5df9]" />

              {/* Scanning line animation hint */}
              <div className="absolute inset-x-6 h-px bg-[#4c5df9] opacity-60 animate-pulse" style={{ top: '42%' }} />
            </div>
          </div>
        </div>

        {/* Instruction card - using design system Card */}
        <Card variant={isDark ? 'dark' : 'default'} className="mb-6 flex gap-3">
          <div className="mt-0.5 text-[#4c5df9]">
            <Info size={20} />
          </div>
          <p className="text-[13px] leading-snug opacity-90">
            Place barcode inside the frame to scan.<br />
            Please keep your device steady when scanning to ensure accurate results.
          </p>
        </Card>
      </div>

      {/* Bottom button */}
      <div className="px-6 pb-8">
        <Button fullWidth className="h-[54px] text-[17px]">
          Scan Now
        </Button>
      </div>
    </div>
  )
}
