import { useState } from 'react'
import { ArrowLeft, Phone } from 'lucide-react'

interface MessagesPageProps {
  onBack?: () => void
  variant?: 'light' | 'dark'
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

interface Conversation {
  id: number
  name: string
  lastMessage: string
  time: string
  avatarColor: string
  unread?: number
  online?: boolean
}

const conversations: Conversation[] = [
  { id: 1, name: 'Arman Nijum', lastMessage: 'Sure, I’ll be there in 3 minutes.', time: '2m', avatarColor: '#4c5df9', online: true },
  { id: 2, name: 'Sara Patel', lastMessage: 'Thanks for the smooth ride!', time: '1h', avatarColor: '#f59e0b', unread: 2 },
  { id: 3, name: 'Marcus Chen', lastMessage: 'Can you drop me at the mall entrance?', time: 'Yesterday', avatarColor: '#10b981' },
  { id: 4, name: 'Priya Sharma', lastMessage: 'Payment received, thanks!', time: 'Yesterday', avatarColor: '#8b5cf6' },
]

export function MessagesPage({ onBack, variant = 'dark' }: MessagesPageProps) {
  const isDark = variant === 'dark'
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState([
    { fromMe: false, text: 'Hey Porsign, thanks for placing the order!', time: '1:00 AM' },
    { fromMe: true, text: 'Sure! I’ll give my best for your classes!', time: '1:00 AM' },
  ])

  const bg = isDark ? '#121826' : '#ffffff'
  const headerBg = isDark ? '#121826' : '#ffffff'
  const textColor = isDark ? '#f8fafc' : '#161a21'
  const muted = isDark ? '#90959e' : '#6b7280'
  const bubbleMe = isDark ? '#4c5df9' : '#5d5fef'
  const bubbleOther = isDark ? '#181b3a' : '#f2f4ff'

  const currentConv = conversations.find(c => c.id === selectedChat)

  const sendMessage = () => {
    if (!messageInput.trim()) return
    setMessages(prev => [...prev, { fromMe: true, text: messageInput.trim(), time: 'Now' }])
    setMessageInput('')
    // fake reply after delay
    setTimeout(() => {
      setMessages(prev => [...prev, { fromMe: false, text: 'Got it, thanks!', time: 'Now' }])
    }, 850)
  }

  // LIST VIEW
  if (!selectedChat) {
    return (
      <div className="screen flex flex-col" style={{ backgroundColor: bg, color: textColor }}>
        <div className={`status-bar px-6 pt-1 ${isDark ? '' : 'light'}`}>
          <div>9:41</div>
          <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-4 flex items-center justify-between" style={{ backgroundColor: headerBg }}>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-10 h-10 rounded-xl border flex items-center justify-center active:opacity-70" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
              <ArrowLeft size={20} color={isDark ? '#f8fafc' : '#161a21'} />
            </button>
            <div className="font-semibold text-xl" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>Messages</div>
          </div>
          <button className="text-[#4c5df9] font-semibold text-sm px-3">New Chat</button>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="bg-[#f1f3f5] rounded-2xl px-4 py-3 text-sm" style={{ color: muted }}>
            Search conversations...
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setSelectedChat(conv.id)
                setMessages([
                  { fromMe: false, text: 'Hey Porsign, thanks for placing the order!', time: '1:00 AM' },
                  { fromMe: true, text: 'Sure! I’ll give my best for your classes!', time: '1:00 AM' },
                ])
              }}
              className="w-full flex items-center gap-4 px-4 py-4 active:bg-white/5 rounded-2xl text-left"
            >
              <div className="relative flex-shrink-0">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                  style={{ backgroundColor: conv.avatarColor }}
                >
                  {conv.name.split(' ').map(n => n[0]).join('')}
                </div>
                {conv.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#121826]" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <div className="font-semibold text-[17px]" style={{ fontFamily: 'Sen, system-ui, sans-serif' }}>{conv.name}</div>
                  <div className="text-xs" style={{ color: muted }}>{conv.time}</div>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <div className="text-sm truncate pr-3" style={{ color: muted }}>{conv.lastMessage}</div>
                  {conv.unread && (
                    <div className="bg-[#4c5df9] text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{conv.unread}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // DETAIL VIEW (chat)
  return (
    <div className="screen flex flex-col" style={{ backgroundColor: bg, color: textColor }}>
      <div className={`status-bar px-6 pt-1 ${isDark ? '' : 'light'}`}>
        <div>9:41</div>
        <div className="flex gap-1.5 text-xs"><span>●●●●●</span><span>100%</span></div>
      </div>

      {/* Chat Header */}
      <div className="px-4 pt-2 pb-3 flex items-center justify-between border-b" style={{ borderColor: isDark ? '#1e293b' : '#eee', backgroundColor: headerBg }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedChat(null)} className="w-9 h-9 rounded-xl border flex items-center justify-center" style={{ borderColor: isDark ? '#334155' : '#e5e7eb' }}>
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm"
              style={{ backgroundColor: currentConv?.avatarColor || '#4c5df9' }}
            >
              {currentConv?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold">{currentConv?.name}</div>
              <div className="text-emerald-500 text-xs flex items-center gap-1">● Online</div>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10" onClick={() => alert('Calling driver (demo)')}>
          <Phone size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ background: isDark ? '#0f141f' : '#fafafa' }}>
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[78%] rounded-3xl px-4 py-2.5 text-[15px] leading-snug ${m.fromMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}
              style={{ 
                backgroundColor: m.fromMe ? bubbleMe : bubbleOther,
                color: m.fromMe ? '#fff' : textColor 
              }}
            >
              {m.text}
              <div className="text-[10px] mt-1 opacity-60 text-right">{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2" style={{ borderColor: isDark ? '#1e293b' : '#eee', backgroundColor: bg }}>
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type something..."
          className="flex-1 bg-[#f1f3f5] rounded-2xl px-5 py-3 text-[15px] outline-none"
          style={{ color: textColor }}
        />
        <button 
          onClick={sendMessage}
          className="btn-primary w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
