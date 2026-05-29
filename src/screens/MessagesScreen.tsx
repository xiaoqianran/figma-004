import React from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { StatusBar } from '../components/ui/StatusBar'

interface MessagesScreenProps {
  onBack?: () => void
}

export function MessagesScreen({ onBack }: MessagesScreenProps) {
  const conversations = [
    { id: 1, name: 'Alex Rivera', role: 'Driver • Tesla Model 3', last: 'I’m 2 min away', time: 'now', unread: 1, avatar: 'AR' },
    { id: 2, name: 'Support • Meteor', role: 'Ride support', last: 'Thanks for riding with us!', time: '2h', unread: 0, avatar: 'M' },
    { id: 3, name: 'Jordan Kim', role: 'Driver • Yesterday', last: 'Have a great day!', time: 'yest', unread: 0, avatar: 'JK' },
  ]

  return (
    <div className="screen bg-[#f8fafc] flex flex-col">
      {/* Design system StatusBar */}
      <StatusBar variant="light" />

      {/* Header */}
      <div className="px-6 pt-2 pb-3 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 active:bg-gray-100">
            <ArrowLeft size={19} />
          </button>
        )}
        <div className="flex-1">
          <div className="font-semibold text-[22px] tracking-tight">Messages</div>
        </div>
        <button className="w-9 h-9 flex items-center justify-center text-[#4c5df9]">
          <Search size={20} />
        </button>
      </div>

      {/* Search bar */}
      <div className="px-5 pb-3">
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input placeholder="Search conversations" className="flex-1 text-[15px] outline-none placeholder:text-gray-400" />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 px-2 overflow-auto pb-4">
        {conversations.map((c) => (
          <div key={c.id} className="mx-3 mb-2 bg-white rounded-3xl px-4 py-3.5 flex items-center gap-3 active:bg-gray-50 border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 flex items-center justify-center text-sm font-semibold text-gray-600 ring-1 ring-gray-300/60">
              {c.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <div className="font-semibold text-[15px] text-[#1c1f2a]">{c.name}</div>
                <div className="text-[11px] text-gray-400 tabular-nums">{c.time}</div>
              </div>
              <div className="text-sm text-gray-500 truncate">{c.role}</div>
              <div className="text-sm text-gray-600 mt-0.5 truncate">{c.last}</div>
            </div>
            {c.unread > 0 && (
              <div className="w-5 h-5 rounded-full bg-[#4c5df9] text-[10px] text-white flex items-center justify-center font-medium">{c.unread}</div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state hint at bottom */}
      <div className="px-6 pb-5 text-center">
        <div className="text-[11px] text-gray-400">Messages are end-to-end encrypted</div>
      </div>
    </div>
  )
}
