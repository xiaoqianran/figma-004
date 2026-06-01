import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Search, Phone } from 'lucide-react'
import { StatusBar } from '../components/ui/StatusBar'
import { motion, AnimatePresence } from 'framer-motion'

interface MessagesScreenProps {
  onBack?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

interface Message {
  id: number
  fromMe: boolean
  text: string
  time: string
}

interface Conversation {
  id: number
  name: string
  role: string
  last: string
  time: string
  unread: number
  avatar: string
  online?: boolean
  avatarColor?: string
}

export function MessagesScreen({ onBack, showToast }: MessagesScreenProps) {
  // Stateful conversations (updates live when messages sent/received for alive feel)
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 1, name: 'Alex Rivera', role: 'Driver • Tesla Model 3', last: 'I’m 2 min away', time: 'now', unread: 1, avatar: 'AR', online: true, avatarColor: '#4c5df9' },
    { id: 2, name: 'Support • Meteor', role: 'Ride support', last: 'Thanks for riding with us!', time: '2h', unread: 0, avatar: 'M', online: true, avatarColor: '#10b981' },
    { id: 3, name: 'Jordan Kim', role: 'Driver • Yesterday', last: 'Have a great day!', time: 'yest', unread: 0, avatar: 'JK', online: false, avatarColor: '#8b5cf6' },
  ])

  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [messagesById, setMessagesById] = useState<Record<number, Message[]>>({
    1: [
      { id: 101, fromMe: false, text: "Hey, I'm on my way — 2 minutes out.", time: '9:38' },
      { id: 102, fromMe: true, text: "Perfect, I'll be waiting outside the lobby.", time: '9:39' },
    ],
    2: [
      { id: 201, fromMe: false, text: "Thanks for riding with Meteor today!", time: '7:20' },
      { id: 202, fromMe: true, text: "Loved the experience, will rate 5★", time: '7:21' },
    ],
    3: [
      { id: 301, fromMe: false, text: "Have a great day!", time: 'Yesterday' },
    ],
  })

  // Local toasts for "sent" / notifications (works standalone in full-flow overlay + gallery)
  const [localToasts, setLocalToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentConv = conversations.find(c => c.id === selectedChat)
  const currentMessages = selectedChat != null ? (messagesById[selectedChat] || []) : []

  // Auto-scroll to latest message
  useEffect(() => {
    if (selectedChat != null) {
      const t = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 50)
      return () => clearTimeout(t)
    }
  }, [currentMessages.length, selectedChat])

  // Note: input cleared inside selectChat handler (avoids setState-in-effect lint error)

  function addToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    // eslint-disable-next-line react-hooks/purity
    const id = Date.now() + Math.random()
    setLocalToasts(prev => [...prev, { id, message, type }])
    // auto-dismiss
    setTimeout(() => {
      setLocalToasts(prev => prev.filter(t => t.id !== id))
    }, 2300)
    // Also forward to parent if provided (for gallery/full-flow integration)
    showToast?.(message, type)
  }

  function getSimulatedReply(convId: number, userText: string): string {
    const lower = userText.toLowerCase().trim()
    if (lower.includes('thank') || lower.includes('thanks')) {
      return convId === 2 ? "You're very welcome — safe travels!" : "No problem at all!"
    }
    if (lower.includes('eta') || lower.includes('long') || lower.includes('where') || lower.includes('arriv')) {
      return "About 90 seconds away now."
    }
    if (lower.includes('here') || lower.includes('outside')) {
      return "Pulling up right now!"
    }

    if (convId === 1) {
      const driverReplies = ["On my way!", "Be there in 1 min.", "Traffic is clear — almost there.", "Pulling up to the curb.", "Thanks, see you in a sec!"]
      // eslint-disable-next-line react-hooks/purity
      return driverReplies[Math.floor(Math.random() * driverReplies.length)]
    }
    if (convId === 2) {
      const supportReplies = ["Thanks for the update!", "We've noted that. Anything else?", "Glad we could help!", "Appreciate you riding with us.", "Is there more I can assist with?"]
      // eslint-disable-next-line react-hooks/purity
      return supportReplies[Math.floor(Math.random() * supportReplies.length)]
    }
    const other = ["Sounds good!", "Have a great day!", "Thanks for letting me know.", "👍"]
    // eslint-disable-next-line react-hooks/purity
    return other[Math.floor(Math.random() * other.length)]
  }

  const sendMessage = (overrideText?: string) => {
    const text = (overrideText ?? messageInput).trim()
    if (!text || selectedChat == null) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    // eslint-disable-next-line react-hooks/purity
    const newMsg: Message = { id: Date.now(), fromMe: true, text, time: now }

    // Append user message
    setMessagesById(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMsg]
    }))

    // Update list preview + clear unread
    setConversations(prev => prev.map(c =>
      c.id === selectedChat
        ? {
            ...c,
            last: text.length > 32 ? text.slice(0, 29) + '...' : text,
            time: 'now',
            unread: 0,
          }
        : c
    ))

    setMessageInput('')

    // Feedback
    addToast('Message sent', 'success')

    // Simulated contextual reply (600-900ms)
    // eslint-disable-next-line react-hooks/purity
    const delay = 620 + Math.random() * 280
    setTimeout(() => {
      // Guard in case chat was closed
      setMessagesById(curr => {
        if (!curr[selectedChat]) return curr
        const replyText = getSimulatedReply(selectedChat, text)
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const reply: Message = { id: Date.now() + 1, fromMe: false, text: replyText, time: replyTime }

        // Update preview with reply too
        setConversations(prevConvos => prevConvos.map(c =>
          c.id === selectedChat
            ? { ...c, last: replyText.length > 32 ? replyText.slice(0, 29) + '...' : replyText, time: 'now' }
            : c
        ))

        return {
          ...curr,
          [selectedChat]: [...(curr[selectedChat] || []), reply]
        }
      })
    }, delay)
  }

  const quickReplies = selectedChat === 1
    ? ['On my way?', 'ETA?', 'Thanks!']
    : selectedChat === 2
    ? ['Thanks', 'All good', 'Need help?']
    : ['👍', 'See you!', 'Thanks']

  // Unified root with framer slide transition between list <-> chat (inline panel / slide-in feel)
  return (
    <div className="h-full bg-[#f8fafc] flex flex-col overflow-hidden relative">
      <StatusBar variant="light" />

      <AnimatePresence mode="wait">
        {/* LIST VIEW */}
        {!selectedChat && (
          <motion.div
            key="list"
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Header */}
            <div className="px-6 pt-2 pb-3 flex items-center gap-3 flex-shrink-0">
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 active:bg-gray-100"
                >
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
            <div className="px-5 pb-3 flex-shrink-0">
              <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-100">
                <Search size={18} className="text-gray-400" />
                <input
                  placeholder="Search conversations"
                  className="flex-1 text-[15px] outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Conversations — tappable rows open inline chat */}
            <div className="flex-1 px-2 overflow-auto pb-4">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedChat(c.id)
                    setMessageInput('')
                    // Mark as read on open
                    setConversations(prev =>
                      prev.map(x => (x.id === c.id ? { ...x, unread: 0 } : x))
                    )
                  }}
                  className="w-full text-left mx-3 mb-2 bg-white rounded-3xl px-4 py-3.5 flex items-center gap-3 active:bg-gray-50 border border-gray-100 active:scale-[0.995] transition-all"
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white ring-1 ring-gray-300/60"
                      style={{ backgroundColor: c.avatarColor || '#64748b' }}
                    >
                      {c.avatar}
                    </div>
                    {c.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[2.5px] border-white" />
                    )}
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
                    <div className="w-5 h-5 rounded-full bg-[#4c5df9] text-[10px] text-white flex items-center justify-center font-medium flex-shrink-0">
                      {c.unread}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Encrypted hint (with padding so it doesn't hide under BottomNav in overlay) */}
            <div className="px-6 pb-20 text-center flex-shrink-0">
              <div className="text-[11px] text-gray-400">Messages are end-to-end encrypted</div>
            </div>
          </motion.div>
        )}

        {/* CHAT VIEW — smooth slide-in from right, full history + input + simulated replies */}
        {selectedChat && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.75 }}
            className="flex-1 flex flex-col min-h-0 pb-[72px]"  // extra bottom padding ensures input + quick replies sit above the BottomNavBar in HomeScreen overlay (z-50)
          >
            {/* Chat Header */}
            <div className="px-4 pt-2 pb-3 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedChat(null); setMessageInput('') }}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center active:bg-gray-100"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm ring-1 ring-gray-300/50"
                      style={{ backgroundColor: currentConv?.avatarColor || '#4c5df9' }}
                    >
                      {currentConv?.avatar}
                    </div>
                    {currentConv?.online && (
                      <div className="absolute -bottom-px -right-px w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] leading-none tracking-[-0.1px]">{currentConv?.name}</div>
                    <div className="text-emerald-500 text-xs mt-1 flex items-center gap-1">● Online</div>
                  </div>
                </div>
              </div>

              <button
                className="w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100 text-[#4c5df9]"
                onClick={() => addToast('Calling (demo)', 'info')}
              >
                <Phone size={19} />
              </button>
            </div>

            {/* Message history (scrollable, auto-scrolls on new msgs) */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f8fafc]">
              {currentMessages.map((m, idx) => (
                <div key={m.id ?? idx} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[78%] rounded-3xl px-4 py-2.5 text-[15px] leading-snug shadow-sm ${m.fromMe ? 'rounded-tr-md' : 'rounded-tl-md'}`}
                    style={{
                      backgroundColor: m.fromMe ? '#4c5df9' : '#f1f5f9',
                      color: m.fromMe ? '#ffffff' : '#1c1f2a',
                    }}
                  >
                    {m.text}
                    <div className={`text-[10px] mt-1 text-right tabular-nums ${m.fromMe ? 'opacity-70' : 'opacity-50'}`}>
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick reply suggestions — tap to send instantly + trigger reply */}
            {quickReplies.length > 0 && (
              <div className="px-4 pt-2 pb-1 flex gap-2 overflow-x-auto bg-[#f8fafc] border-t border-gray-100 flex-shrink-0">
                {quickReplies.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="flex-shrink-0 px-3.5 py-1.5 text-sm bg-white border border-gray-200 rounded-full active:bg-gray-50 active:scale-[0.985] text-[#4c5df9] whitespace-nowrap transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Composer with Enter support */}
            <div className="p-4 border-t border-gray-100 bg-white flex gap-2 items-center flex-shrink-0">
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-[#f1f3f5] rounded-2xl px-5 py-3 text-[15px] outline-none border border-transparent focus:border-gray-200 placeholder:text-gray-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!messageInput.trim()}
                className="btn-primary w-11 h-11 rounded-2xl flex items-center justify-center text-lg active:scale-[0.92] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local toasts layer (top of screen, works for both list and chat views) */}
      <div className="absolute top-[52px] left-3 right-3 z-[70] pointer-events-none flex flex-col items-center gap-2">
        <AnimatePresence>
          {localToasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              onClick={() => setLocalToasts(prev => prev.filter(x => x.id !== t.id))}
              className={`toast pointer-events-auto max-w-[260px] text-center shadow-xl ${t.type}`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
