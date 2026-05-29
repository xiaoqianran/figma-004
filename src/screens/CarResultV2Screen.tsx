import { useState } from 'react'
import { Filter, Menu } from 'lucide-react'

interface CarResultV2ScreenProps {
  onBack?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

const priceTags = [
  { id: 1, price: '$9', x: '62%', y: '28%' },
  { id: 2, price: '$5', x: '78%', y: '52%' },
  { id: 3, price: '$7', x: '29%', y: '59%' },
  { id: 4, price: '$2', x: '26%', y: '41%' },
]

export function CarResultV2Screen({ onBack }: CarResultV2ScreenProps) {
  const [selected, setSelected] = useState(false)

  return (
    <div className="screen bg-[#f4f4f4] flex flex-col overflow-hidden">
      {/* Status bar */}
      <div className="status-bar light px-6 pt-1 text-[#1c1f2a] z-10 relative">
        <div>9:41</div>
        <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
      </div>

      {/* Map area */}
      <div className="relative flex-1 -mt-11" style={{ background: 'linear-gradient(#d1d5db, #e5e7eb)' }}>
        {/* Fake map texture */}
        <div className="absolute inset-0 opacity-60" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(148,163,184,0.25) 12px, rgba(148,163,184,0.25) 13px)`
        }} />

        {/* Streets */}
        <div className="absolute inset-0">
          <div className="absolute left-[12%] top-0 bottom-0 w-[7px] bg-[#94a3b8] rotate-[13deg] origin-top" />
          <div className="absolute top-[31%] left-0 right-0 h-1 bg-[#94a3b8]" />
          <div className="absolute top-[61%] left-[6%] right-[12%] h-[3px] bg-[#94a3b8] rotate-[-6deg]" />
        </div>

        {/* Floating price tags */}
        {priceTags.map(tag => (
          <div 
            key={tag.id}
            className="absolute px-3 py-1 bg-white shadow rounded-2xl text-sm font-semibold flex items-center"
            style={{ left: tag.x, top: tag.y }}
          >
            {tag.price}
          </div>
        ))}

        {/* Driver / pickup pins */}
        <div className="absolute left-[43%] top-[36%]">
          <div className="w-4 h-4 rounded-full border-[2.5px] border-white bg-[#4c5df9] shadow" />
        </div>
        <div className="absolute left-[55%] top-[72%] flex flex-col items-center">
          <div className="text-lg">📍</div>
        </div>

        {/* Top floating controls */}
        <div className="absolute top-14 left-5 right-5 flex justify-between z-10">
          <button onClick={onBack} className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow active:scale-95">
            <Menu size={20} className="text-[#1c1f2a]" />
          </button>
          <button className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow active:scale-95">
            <Filter size={19} className="text-[#1c1f2a]" />
          </button>
        </div>

        {/* Bottom prominent car card (V2 style) */}
        <div className="absolute bottom-5 left-5 right-5 z-20">
          <div 
            onClick={() => setSelected(!selected)}
            className={`bg-white rounded-3xl p-4 shadow-2xl border transition-all cursor-pointer ${selected ? 'border-[#4c5df9]' : 'border-transparent'}`}
          >
            <div className="flex gap-4">
              {/* Car thumb */}
              <div className="w-[94px] h-[76px] bg-gradient-to-br from-[#e2e8f0] to-white rounded-2xl flex-shrink-0 overflow-hidden relative flex items-center justify-center">
                <div className="text-4xl">🚘</div>
                <div className="absolute top-2 left-2 px-2 py-px text-[10px] bg-emerald-500 text-white rounded font-medium">Electric</div>
              </div>

              <div className="flex-1 pt-1">
                <div className="font-semibold text-[17px]">Tesla Model 5</div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-px">
                  <span>5 min walk (1.5km)</span>
                </div>

                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-semibold">Price : $12/5Km</span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[1,2,3,4].map(i => <span key={i} className="text-[#ff712f] text-sm">★</span>)}
                    <span className="text-[#9fa1b0] text-sm">★</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden ml-1">
                    <div className="w-full h-full bg-[#c4c4c4]" />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#4c5df9] flex items-center justify-center">
                    <span className="text-[9px] text-white">✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Book CTA */}
            <button 
              onClick={(e) => { e.stopPropagation(); alert('Ride booked with Tesla Model 5! (demo)') }}
              className="mt-4 w-full h-11 rounded-2xl bg-[#4c5df9] text-white font-semibold active:bg-[#3b4dd9] text-[16px]"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
