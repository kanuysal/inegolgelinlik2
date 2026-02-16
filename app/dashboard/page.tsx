'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  getMyListings,
  deleteListing,
  getMyPurchases,
  getMySales,
  getMyConversations,
  getConversationMessages,
  sendMessage,
  getMyProfile,
  updateProfile,
  getMyNotifications,
  markNotificationRead,
} from './actions'

type Tab = 'listings' | 'purchases' | 'messages' | 'profile'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-600',
  pending_review: 'bg-yellow-600',
  approved: 'bg-emerald-600',
  rejected: 'bg-red-600',
  sold: 'bg-blue-600',
  archived: 'bg-zinc-500',
  pending: 'bg-yellow-600',
  confirmed: 'bg-blue-500',
  shipped: 'bg-purple-600',
  delivered: 'bg-emerald-500',
  completed: 'bg-emerald-600',
  cancelled: 'bg-red-500',
  refunded: 'bg-orange-500',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${STATUS_COLORS[status] || 'bg-zinc-600'} text-white text-xs px-2.5 py-1 rounded-full font-sans uppercase tracking-wider`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

// ═══════════════════════════════════════════════════════
// MY LISTINGS TAB
// ═══════════════════════════════════════════════════════
function ListingsTab() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getMyListings().then(d => { setListings(d); setLoading(false) })
  }, [])

  const handleDelete = (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    startTransition(async () => {
      const res = await deleteListing(id)
      if (res.success) setListings(prev => prev.filter(l => l.id !== id))
    })
  }

  if (loading) return <LoadingSkeleton />

  if (listings.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">👗</div>
        <h3 className="font-serif text-2xl text-champagne mb-2">No listings yet</h3>
        <p className="text-zinc-400 font-sans mb-6">Start selling your Galia Lahav gown today</p>
        <Link href="/sell/submit" className="inline-block bg-gold-muted text-obsidian px-8 py-3 font-sans text-sm uppercase tracking-widest hover:bg-champagne transition-colors">
          Create Listing
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <p className="font-sans text-zinc-400 text-sm">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
        <Link href="/sell/submit" className="bg-gold-muted text-obsidian px-6 py-2.5 font-sans text-xs uppercase tracking-widest hover:bg-champagne transition-colors">
          + New Listing
        </Link>
      </div>
      {listings.map((listing: any) => (
        <div key={listing.id} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 flex gap-5 items-start hover:border-zinc-700 transition-colors">
          <div className="w-20 h-20 bg-zinc-800 rounded-lg flex-shrink-0 overflow-hidden">
            {listing.images?.[0] ? (
              <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-2xl">👗</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-champagne truncate">{listing.title}</h3>
                <p className="font-sans text-xs text-zinc-500 mt-0.5">
                  {listing.category} · Size {listing.size_us || '—'} · ${listing.price?.toLocaleString()}
                </p>
              </div>
              <StatusBadge status={listing.status} />
            </div>
            {listing.rejection_reason && (
              <p className="text-red-400 text-xs font-sans mt-2 bg-red-900/20 px-3 py-1.5 rounded">
                Rejection reason: {listing.rejection_reason}
              </p>
            )}
            <div className="flex gap-3 mt-3">
              {(listing.status === 'draft' || listing.status === 'rejected') && (
                <button onClick={() => handleDelete(listing.id)} disabled={isPending} className="text-red-400 text-xs font-sans hover:text-red-300 transition-colors">
                  Delete
                </button>
              )}
              <p className="text-zinc-600 text-xs font-sans">
                Created {new Date(listing.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MY PURCHASES TAB
// ═══════════════════════════════════════════════════════
function PurchasesTab() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [view, setView] = useState<'purchases' | 'sales'>('purchases')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyPurchases(), getMySales()]).then(([p, s]) => {
      setPurchases(p); setSales(s); setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSkeleton />

  const orders = view === 'purchases' ? purchases : sales

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setView('purchases')} className={`px-5 py-2 rounded-full font-sans text-xs uppercase tracking-wider transition-colors ${view === 'purchases' ? 'bg-gold-muted text-obsidian' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
          Purchases ({purchases.length})
        </button>
        <button onClick={() => setView('sales')} className={`px-5 py-2 rounded-full font-sans text-xs uppercase tracking-wider transition-colors ${view === 'sales' ? 'bg-gold-muted text-obsidian' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
          Sales ({sales.length})
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">{view === 'purchases' ? '🛍️' : '💰'}</div>
          <h3 className="font-serif text-2xl text-champagne mb-2">
            No {view} yet
          </h3>
          <p className="text-zinc-400 font-sans">
            {view === 'purchases' ? 'Browse the shop to find your dream gown' : 'Create a listing to start selling'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg text-champagne">{order.listings?.title || 'Listing'}</h3>
                  <p className="font-sans text-xs text-zinc-500 mt-1">
                    Order #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-800">
                <div>
                  <p className="text-zinc-500 text-xs font-sans">Total</p>
                  <p className="text-champagne font-serif text-lg">${order.total?.toLocaleString()}</p>
                </div>
                {view === 'sales' && (
                  <>
                    <div>
                      <p className="text-zinc-500 text-xs font-sans">Commission</p>
                      <p className="text-zinc-300 font-sans">${order.commission_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-sans">Your Payout</p>
                      <p className="text-emerald-400 font-serif text-lg">${order.seller_payout?.toLocaleString()}</p>
                    </div>
                  </>
                )}
                {order.tracking_number && (
                  <div>
                    <p className="text-zinc-500 text-xs font-sans">Tracking</p>
                    <p className="text-gold-muted font-sans text-sm">{order.tracking_number}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MESSAGES TAB
// ═══════════════════════════════════════════════════════
function MessagesTab() {
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConv, setActiveConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getMyConversations().then(d => { setConversations(d); setLoading(false) })
  }, [])

  const openConversation = (convId: string) => {
    setActiveConv(convId)
    getConversationMessages(convId).then(setMessages)
  }

  const handleSend = () => {
    if (!activeConv || !newMsg.trim()) return
    startTransition(async () => {
      const res = await sendMessage(activeConv, newMsg)
      if (res.success) {
        setNewMsg('')
        const updated = await getConversationMessages(activeConv)
        setMessages(updated)
      }
    })
  }

  if (loading) return <LoadingSkeleton />

  if (conversations.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">💬</div>
        <h3 className="font-serif text-2xl text-champagne mb-2">No messages yet</h3>
        <p className="text-zinc-400 font-sans">Conversations will appear here when buyers contact you about your listings</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-800 rounded-lg overflow-hidden min-h-[500px]">
      {/* Conversation list */}
      <div className="md:col-span-1 border-r border-zinc-800 bg-zinc-900/40">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-sans text-xs uppercase tracking-widest text-zinc-500">Conversations</h3>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {conversations.map((conv: any) => {
            const lastMsg = conv.messages?.[conv.messages.length - 1]
            const unread = conv.messages?.filter((m: any) => !m.is_read).length || 0
            return (
              <button key={conv.id} onClick={() => openConversation(conv.id)} className={`w-full text-left p-4 hover:bg-zinc-800/50 transition-colors ${activeConv === conv.id ? 'bg-zinc-800/70' : ''}`}>
                <p className="font-serif text-sm text-champagne truncate">{conv.listings?.title || 'Listing'}</p>
                <p className="font-sans text-xs text-zinc-500 truncate mt-1">{lastMsg?.content || 'No messages'}</p>
                {unread > 0 && (
                  <span className="inline-block mt-1 bg-gold-muted text-obsidian text-xs px-2 py-0.5 rounded-full font-sans">{unread} new</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Message thread */}
      <div className="md:col-span-2 flex flex-col">
        {activeConv ? (
          <>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.sender_id === conversations.find((c: any) => c.id === activeConv)?.buyer_id ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.sender_id === conversations.find((c: any) => c.id === activeConv)?.buyer_id ? 'bg-zinc-800 text-zinc-200' : 'bg-gold-muted/20 text-champagne'}`}>
                    <p className="font-sans text-sm">{msg.content}</p>
                    <p className="font-sans text-[10px] text-zinc-500 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-zinc-800 flex gap-3">
              <input
                type="text"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-5 py-2.5 font-sans text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-gold-muted"
              />
              <button onClick={handleSend} disabled={isPending || !newMsg.trim()} className="bg-gold-muted text-obsidian px-6 py-2.5 rounded-full font-sans text-xs uppercase tracking-widest hover:bg-champagne transition-colors disabled:opacity-40">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-600 font-sans text-sm">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════
function ProfileTab() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getMyProfile().then(d => { setProfile(d); setLoading(false) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.target as HTMLFormElement)
    const res = await updateProfile(form)
    setSaving(false)
    if (res.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) return <LoadingSkeleton />

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div>
        <label className="block font-sans text-xs uppercase tracking-widest text-zinc-500 mb-2">Email</label>
        <input type="email" value={profile?.email || ''} disabled className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 font-sans text-sm text-zinc-400 cursor-not-allowed" />
      </div>
      <div>
        <label className="block font-sans text-xs uppercase tracking-widest text-zinc-500 mb-2">Display Name</label>
        <input name="display_name" defaultValue={profile?.display_name || ''} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 font-sans text-sm text-white focus:outline-none focus:border-gold-muted transition-colors" placeholder="How others see you" />
      </div>
      <div>
        <label className="block font-sans text-xs uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
        <input name="full_name" defaultValue={profile?.full_name || ''} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 font-sans text-sm text-white focus:outline-none focus:border-gold-muted transition-colors" placeholder="For shipping & invoicing" />
      </div>
      <div>
        <label className="block font-sans text-xs uppercase tracking-widest text-zinc-500 mb-2">Phone</label>
        <input name="phone" defaultValue={profile?.phone || ''} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 font-sans text-sm text-white focus:outline-none focus:border-gold-muted transition-colors" placeholder="+1 (555) 000-0000" />
      </div>
      <button type="submit" disabled={saving} className="bg-gold-muted text-obsidian px-8 py-3 font-sans text-sm uppercase tracking-widest hover:bg-champagne transition-colors disabled:opacity-50">
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </form>
  )
}

// ═══════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 animate-pulse">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-zinc-800 rounded-lg" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ═══════════════════════════════════════════════════════
export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('listings')
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    getMyNotifications().then(setNotifications)
  }, [])

  const unreadCount = notifications.filter((n: any) => !n.is_read).length

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'listings', label: 'My Listings', icon: '👗' },
    { key: 'purchases', label: 'Orders', icon: '🛍️' },
    { key: 'messages', label: 'Messages', icon: '💬' },
    { key: 'profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-[0.3em] text-champagne">
            RE:GALIA
          </Link>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <span className="bg-gold-muted text-obsidian text-xs px-2.5 py-1 rounded-full font-sans">
                {unreadCount} notification{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
            <Link href="/shop" className="font-sans text-xs uppercase tracking-widest text-zinc-400 hover:text-champagne transition-colors">
              Shop
            </Link>
            <Link href="/sell/submit" className="font-sans text-xs uppercase tracking-widest text-zinc-400 hover:text-champagne transition-colors">
              Sell
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-serif text-4xl text-champagne mb-8">Dashboard</h1>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-8 border-b border-zinc-800">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 font-sans text-sm transition-colors relative ${
                tab === t.key
                  ? 'text-champagne'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="mr-2">{t.icon}</span>
              {t.label}
              {tab === t.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-muted" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'listings' && <ListingsTab />}
        {tab === 'purchases' && <PurchasesTab />}
        {tab === 'messages' && <MessagesTab />}
        {tab === 'profile' && <ProfileTab />}
      </div>
    </div>
  )
}
