import { Home, Search, MessageCircle, User } from 'lucide-react'

export type NavTab = 'home' | 'search' | 'messages' | 'profile'

interface BottomNavBarProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
  hasActiveRide?: boolean
}

export function BottomNavBar({ activeTab, onTabChange, hasActiveRide = false }: BottomNavBarProps) {
  const tabs: { key: NavTab; label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
    { key: 'home', label: 'Home', Icon: Home },
    { key: 'search', label: 'Search', Icon: Search },
    { key: 'messages', label: 'Messages', Icon: MessageCircle },
    { key: 'profile', label: 'Profile', Icon: User },
  ]

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50">
      {/* Safe area + bar */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="h-16 flex items-center justify-around px-2">
          {tabs.map(({ key, label, Icon }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  isActive ? 'text-[#4c5df9]' : 'text-gray-400 active:text-gray-500'
                }`}
              >
                <div className="relative">
                  <Icon 
                    width={22} 
                    height={22} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  {key === 'home' && hasActiveRide && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium tracking-[-0.1px] ${isActive ? 'font-semibold' : ''}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
