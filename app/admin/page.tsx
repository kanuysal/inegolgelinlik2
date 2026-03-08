"use client";

import { useState, useEffect, useTransition, useRef } from 'react';
import Link from 'next/link';
import {
  getAdminStats,
  getPendingListings,
  getAllListings,
  approveListing,
  rejectListing,
  getUsers,
  setUserRole,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  uploadProductImage,
  removeProductImage,
  addProductImageUrl,
  bulkImportCatalog,
  syncCatalogImages,
  syncStockistInit,
  syncStockistPage,
  getClaims,
  resolveClaim,
  deleteListing,
  seedTestListings,
  deleteAllTestListings,
  getApprovedListingsForSelector,
  getBrandDirectListings,
  createBrandDirectListing,
  updateBrandDirectListing,
  toggleBrandDirectStatus,
  getFeaturedGowns,
  addFeaturedGown,
  updateFeaturedGown,
  removeFeaturedGown,
  reorderFeaturedGown,
  getAdminConversation,
  adminSendMessage,
  getBrandDirectConversations,
  getBrandDirectMessages,
  adminReplyBrandDirect,
} from './actions';

type Tab = 'dashboard' | 'moderation' | 'brand_direct' | 'brand_messages' | 'inventory' | 'sellers' | 'transactions' | 'claims' | 'featured';

// ═══════════════════════════════════════════════════════
// OVERVIEW TAB (Dashboard)
// ═══════════════════════════════════════════════════════
function OverviewTab() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => setStats(null));
  }, []);

  if (!stats) return <LoadingSkeleton />;

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-slate-200 relative group">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Pending Review</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light font-display">{stats.pendingReview || 0}</h3>
            <span className="text-[10px] text-slate-400">Submissions</span>
          </div>
        </div>
        <div className="bg-white p-6 border border-slate-200">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Total Listings</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light font-display">{stats.totalListings || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 border border-slate-200">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Total Orders</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light font-display">{stats.totalOrders || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 border border-slate-200">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Total Users</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light font-display text-blue-500">{stats.totalUsers || 0}</h3>
          </div>
        </div>
      </div>

      {/* Rest of Overview (Placeholder charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-medium tracking-tight">Recent Activity</h2>
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                  <span className="material-symbols-outlined text-sm text-accent">add_circle</span>
                </div>
                <div>
                  <p className="text-[13px] font-medium">Dashboard Loaded</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium tracking-tight">System Status</h2>
          </div>
          <div className="bg-white p-8 border border-slate-200 flex items-center justify-center h-64">
            <p className="text-slate-400 font-sans text-sm">All systems nominal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MODERATION TAB
// ═══════════════════════════════════════════════════════
function ModerationTab() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Insufficient Photos (Need 2+ photos of you wearing the dress)');
  const [rejectDetails, setRejectDetails] = useState('');
  const [chatListing, setChatListing] = useState<any | null>(null);
  const [showQueue, setShowQueue] = useState(true);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getPendingListings().then(d => {
      setPending(d);
      if (d.length > 0) setActiveItem(d[0]);
      setLoading(false);
    });
  }, []);

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveListing(id);
      if (res.success) {
        const remaining = pending.filter(l => l.id !== id);
        setPending(remaining);
        if (activeItem?.id === id) setActiveItem(remaining[0] || null);
      }
    });
  };

  const handleReject = () => {
    if (!rejectId) return;
    const finalReason = rejectDetails ? `${rejectReason}: ${rejectDetails}` : rejectReason;
    startTransition(async () => {
      const res = await rejectListing(rejectId, finalReason);
      if (res.success) {
        const remaining = pending.filter(l => l.id !== rejectId);
        setPending(remaining);
        if (activeItem?.id === rejectId) setActiveItem(remaining[0] || null);
        setRejectId(null);
        setRejectDetails('');
      }
    });
  };

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  if (pending.length === 0) {
    return (
      <div className="text-center py-40">
        <div className="text-5xl mb-4 text-emerald-500">
          <span className="material-symbols-outlined text-6xl">check_circle</span>
        </div>
        <h3 className="text-xl font-medium tracking-tight">Queue Empty</h3>
        <p className="text-slate-500 text-sm mt-2">All listings have been reviewed</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Moderation Queue Sidebar */}
      <section className={`${showQueue ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-slate-200 bg-white flex-col flex-shrink-0`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-slate-400">Moderation Queue</h2>
          <span className="bg-primary text-white text-[10px] px-2 py-0.5 font-bold rounded-full">{pending.length}</span>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar pr-2">
          {pending.map(listing => (
            <div
              key={listing.id}
              onClick={() => setActiveItem(listing)}
              className={`p-4 bg-white transition-all cursor-pointer ${activeItem?.id === listing.id
                ? 'border-l-2 border-accent shadow-sm ring-1 ring-slate-200'
                : 'border-l-2 border-transparent hover:border-slate-300'
                }`}
            >
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-slate-100 rounded flex-shrink-0 overflow-hidden">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">👗</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 truncate">ID: {listing.id.slice(0, 8)}</p>
                    {activeItem?.id === listing.id && (
                      <span className="bg-amber-50 text-amber-600 text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider">Review</span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">{listing.title}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">Seller: {listing.profiles?.display_name || listing.profiles?.full_name || 'Unknown'}</p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">{new Date(listing.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Detail View */}
      <section className="flex-1">
        {activeItem ? (
          <div className="bg-white shadow-xl ring-1 ring-slate-200 min-h-[80vh] flex flex-col">
            {/* Detail Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-end">
              <div>
                <p className="text-[11px] text-slate-400 tracking-[0.3em] uppercase mb-2">Submission Details • {activeItem.id.slice(0, 8)}</p>
                <h2 className="text-4xl font-light mb-2">{activeItem.title}</h2>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1 text-slate-500"><span className="material-symbols-outlined text-sm">sell</span> Asking: ${activeItem.price?.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-slate-500"><span className="material-symbols-outlined text-sm">category</span> {activeItem.category}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <button
                  disabled={isPending}
                  className="flex-1 sm:flex-none px-4 py-3 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={() => setChatListing(activeItem)}
                >
                  <span className="material-symbols-outlined text-sm">chat_bubble</span>
                  <span className="hidden sm:inline">Message Bride</span>
                </button>
                <button
                  disabled={isPending}
                  className="flex-1 sm:flex-none px-6 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={() => setRejectId(activeItem.id)}
                >
                  Reject
                </button>
                <button
                  disabled={isPending || (activeItem.images?.length || 0) < 2}
                  className="flex-[2] sm:flex-none px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleApprove(activeItem.id)}
                  title={(activeItem.images?.length || 0) < 2 ? 'Requires at least 2 photos of the bride wearing the dress' : 'Approve this listing'}
                >
                  Approve Listing
                </button>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 overflow-y-auto">
              {/* Images */}
              <div className="bg-white p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400">Imagery Verification</h3>
                  <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${(activeItem.images?.length || 0) >= 2
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                    }`}>
                    <span className="material-symbols-outlined text-sm">
                      {(activeItem.images?.length || 0) >= 2 ? 'check_circle' : 'warning'}
                    </span>
                    <span className="font-bold">
                      {activeItem.images?.length || 0} / 2 photos
                    </span>
                  </div>
                </div>
                {(activeItem.images?.length || 0) < 2 && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                    <span className="font-bold">⚠️ Missing photos:</span> Requires at least 2 photos of the bride wearing the dress before approval.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {activeItem.images?.[0] && (
                    <img src={activeItem.images[0]} alt="Front view" className="aspect-[3/4] object-cover w-full grayscale-[0.3] hover:grayscale-0 transition-all duration-700" />
                  )}
                  <div className="space-y-4">
                    {activeItem.images?.[1] && (
                      <img src={activeItem.images[1]} alt="Detail 1" className="aspect-[3/4] object-cover w-full grayscale-[0.3] hover:grayscale-0 transition-all duration-700" />
                    )}
                    {(activeItem.images?.length || 0) > 2 && (
                      <div className="aspect-[3/4] bg-slate-50 flex flex-col items-center justify-center text-slate-400 rounded">
                        <span className="material-symbols-outlined mb-2">image</span>
                        <span className="text-[10px] uppercase tracking-widest">+{activeItem.images.length - 2} More Photos</span>
                      </div>
                    )}
                  </div>
                </div>

                {activeItem.description && (
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-slate-400">Seller Note</h3>
                    <p className="text-sm leading-relaxed text-slate-600 italic">
                      "{activeItem.description}"
                    </p>
                  </div>
                )}
              </div>

              {/* Specs & Seller Info */}
              <div className="bg-white p-8 space-y-8 overflow-y-auto">
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-slate-400">Specifications</h3>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Color Options</p>
                      <p className="text-sm font-medium">{activeItem.color_options || '—'}</p>
                    </div>
                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Condition</p>
                      <p className="text-sm font-medium">{activeItem.condition || '—'}</p>
                    </div>
                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Year Purchased</p>
                      <p className="text-sm font-medium">{activeItem.year_purchased || '—'}</p>
                    </div>
                    <div className="border-b border-slate-100 pb-2">
                      <p className="text-[10px] uppercase text-slate-400 mb-1">Status</p>
                      <p className="text-sm font-medium capitalize">{activeItem.status?.replace('_', ' ') || '—'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-slate-400">Seller Information</h3>
                  <div className="flex items-center gap-4 p-4 border border-slate-100 rounded">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-display text-lg">
                      {(activeItem.profiles?.display_name || activeItem.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{activeItem.profiles?.display_name || activeItem.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">ID: {activeItem.seller_id.slice(0, 8)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white p-12 text-center">
            <div className="max-w-sm">
              <span className="material-symbols-outlined text-6xl text-slate-100 mb-6 block">verified_user</span>
              <h3 className="text-xl font-light text-slate-400 mb-2">Queue Clear</h3>
              <p className="text-sm text-slate-300 leading-relaxed">Select a submission from the queue to begin the review process.</p>
            </div>
          </div>
        )}

        {/* Mobile View Toggles */}
        {activeItem && (
          <button
            onClick={() => setShowQueue(!showQueue)}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-[55] animate-bounce"
          >
            <span className="material-symbols-outlined">{showQueue ? 'visibility' : 'list'}</span>
          </button>
        )}
      </section>

      {/* Chat Modal Integration */}
      {chatListing && (
        <AdminChat
          listingId={chatListing.id}
          sellerId={chatListing.seller_id}
          sellerName={chatListing.profiles?.display_name || chatListing.profiles?.full_name || 'Seller'}
          onClose={() => setChatListing(null)}
        />
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-display mb-4">Rejection Reason</h3>
            <div className="bg-blue-50 border border-blue-200 p-3 mb-6 rounded">
              <p className="text-xs text-blue-800">
                <span className="font-bold">📧 This message will be sent to the seller.</span> Please be specific about what they need to fix or upload to resubmit the listing.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reason Category</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 focus:ring-accent focus:border-accent"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                >
                  <option>Insufficient Photos (Need 2+ photos of you wearing the dress)</option>
                  <option>Poor Image Quality</option>
                  <option>Missing Verification Photos</option>
                  <option>Non-Galia Lahav Product</option>
                  <option>Condition Not Meeting Standards</option>
                  <option>Pricing Discrepancy</option>
                  <option>Incomplete Information</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detailed Message to Seller</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 text-sm p-3 focus:ring-accent focus:border-accent placeholder:text-slate-400"
                  placeholder="Example: Please upload at least 2 clear photos of yourself wearing the dress. Include front and back views to help buyers see how the dress looks when worn."
                  rows={5}
                  value={rejectDetails}
                  onChange={e => setRejectDetails(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                className="py-3 border border-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-50"
                onClick={() => { setRejectId(null); setRejectDetails(''); }}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                className="py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
                onClick={handleReject}
                disabled={isPending}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ADMIN CHAT COMPONENT
// ═══════════════════════════════════════════════════════

function AdminChat({ listingId, sellerId, sellerName, onClose }: { listingId: string, sellerId: string, sellerName: string, onClose: () => void }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAdminConversation(listingId, sellerId).then(res => {
      if (res.success && res.conversationId) {
        setConversationId(res.conversationId);
        // In a real app, we'd fetch messages here. 
        // For now, let's assume we fetch them and update state.
        import('../dashboard/actions').then(({ getConversationMessages }) => {
          getConversationMessages(res.conversationId!).then(msgs => {
            setMessages(msgs);
            setLoading(false);
          });
        });
      }
    });
  }, [listingId, sellerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !conversationId || sending) return;

    setSending(true);
    const res = await adminSendMessage(conversationId, newMsg);
    if (res.success) {
      setNewMsg('');
      // Refresh messages
      const msgs = await (await import('../dashboard/actions')).getConversationMessages(conversationId);
      setMessages(msgs);
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full h-full md:h-[min(600px,85vh)] md:max-w-lg shadow-2xl flex flex-col md:rounded-lg overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-primary text-white">
          <div>
            <h3 className="text-lg font-display">Chat with {sellerName}</h3>
            <p className="text-[10px] uppercase tracking-widest opacity-70">Listing Inquiry / Tweaks</p>
          </div>
          <button onClick={onClose} className="material-symbols-outlined hover:rotate-90 transition-transform">close</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xs text-slate-400 font-medium">No messages yet. Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender_id === sellerId ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${m.sender_id === sellerId ? 'bg-white text-slate-900 border border-slate-100' : 'bg-primary text-white'}`}>
                  {m.content}
                  <p className={`text-[9px] mt-1 opacity-50 ${m.sender_id === sellerId ? 'text-slate-400' : 'text-primary-foreground'}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Ask for tweaks or provide feedback..."
              className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMsg.trim()}
              className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// BRAND DIRECT TAB
// ═══════════════════════════════════════════════════════
function BrandDirectTab() {
  const [listings, setListings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: 'bridal', condition: 'new_unworn',
    size_us: '', price: '', msrp: '', silhouette: '', train_style: '',
    product_id: '', images: '' as string,
  });

  const refresh = () => {
    setLoading(true);
    Promise.all([getBrandDirectListings(), getProducts()]).then(([l, p]) => {
      setListings(l);
      setProducts(p);
      setLoading(false);
    });
  };

  useEffect(() => { refresh(); }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'bridal', condition: 'new_unworn', size_us: '', price: '', msrp: '', silhouette: '', train_style: '', product_id: '', images: '' });
    setShowForm(false);
    setEditId(null);
    setMsg('');
  };

  const handleSelectProduct = (product: any) => {
    const imgs = product.images?.length > 0 ? JSON.stringify(product.images) : '';
    setForm(f => ({
      ...f,
      title: product.style_name,
      description: product.description || '',
      category: product.category || 'bridal',
      silhouette: product.silhouette || '',
      train_style: product.train_style || '',
      msrp: product.msrp ? String(product.msrp) : '',
      product_id: product.id,
      images: imgs,
    }));
  };

  const handleSave = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    // Ensure images is JSON array
    if (form.images && !form.images.startsWith('[')) {
      fd.set('images', JSON.stringify([form.images]));
    }

    startTransition(async () => {
      let res;
      if (editId) {
        res = await updateBrandDirectListing(editId, fd);
      } else {
        res = await createBrandDirectListing(fd);
      }
      if (res.error) {
        setMsg('Error: ' + res.error);
      } else {
        setMsg(editId ? 'Listing updated!' : 'Listing created!');
        resetForm();
        refresh();
      }
    });
  };

  const handleEdit = (listing: any) => {
    setForm({
      title: listing.title || '',
      description: listing.description || '',
      category: listing.category || 'bridal',
      condition: listing.condition || 'new_unworn',
      size_us: listing.size_us || '',
      price: String(listing.price || ''),
      msrp: listing.msrp ? String(listing.msrp) : '',
      silhouette: listing.silhouette || '',
      train_style: listing.train_style || '',
      product_id: listing.product_id || '',
      images: listing.images ? JSON.stringify(listing.images) : '',
    });
    setEditId(listing.id);
    setShowForm(true);
    setMsg('');
  };

  const handleToggle = (listing: any) => {
    const newStatus = listing.status === 'approved' ? 'archived' : 'approved';
    startTransition(async () => {
      await toggleBrandDirectStatus(listing.id, newStatus);
      refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this Brand Direct listing permanently?')) return;
    startTransition(async () => {
      await deleteListing(id);
      refresh();
    });
  };

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  const parsedImages = (() => {
    try { return JSON.parse(form.images || '[]'); } catch { return []; }
  })();

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 border border-slate-200">
        <div>
          <h2 className="text-lg font-medium tracking-tight">Brand Direct Listings</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            Official Galia Lahav inventory • {listings.length} listings
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-6 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Listing
        </button>
      </div>

      {msg && (
        <div className={`p-3 text-sm ${msg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {msg}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium tracking-tight">{editId ? 'Edit Brand Direct Listing' : 'Create Brand Direct Listing'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Product Selector */}
          {!editId && (
            <div className="bg-blue-50 border border-blue-200 p-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 block">
                Link to Product Catalog ({products.length} products)
              </label>
              <input
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full bg-white border border-blue-300 text-sm py-2 px-3 focus:ring-accent focus:border-accent outline-none mb-2"
                placeholder="Search by style name..."
              />
              <div className="max-h-48 overflow-y-auto bg-white border border-blue-200 divide-y divide-slate-100">
                {products
                  .filter(p => !productSearch || p.style_name.toLowerCase().includes(productSearch.toLowerCase()))
                  .slice(0, 30)
                  .map((product: any) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => { handleSelectProduct(product); setProductSearch(''); }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-blue-50 transition-colors ${form.product_id === product.id ? 'bg-blue-100' : ''}`}
                    >
                      <div className="w-8 h-10 bg-slate-100 flex-shrink-0 overflow-hidden">
                        {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.style_name}</p>
                        <p className="text-[10px] text-slate-500">{product.category} • {product.sku || 'No SKU'}</p>
                      </div>
                      {form.product_id === product.id && (
                        <span className="material-symbols-outlined text-blue-600 text-sm">check_circle</span>
                      )}
                    </button>
                  ))}
              </div>
              <p className="text-[10px] text-blue-500 mt-2">Select a product to auto-fill details, or enter manually below</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 outline-none focus:border-accent" placeholder="The Maya" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Size US</label>
              <input value={form.size_us} onChange={e => setForm(f => ({ ...f, size_us: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 outline-none focus:border-accent" placeholder="4" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Price *</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 outline-none focus:border-accent" placeholder="5000" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">MSRP</label>
              <input type="number" value={form.msrp} onChange={e => setForm(f => ({ ...f, msrp: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 outline-none focus:border-accent" placeholder="12000" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 outline-none focus:border-accent">
                <option value="bridal">Bridal</option>
                <option value="evening">Evening</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Condition</label>
              <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 outline-none focus:border-accent">
                <option value="new_unworn">New / Unworn</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Silhouette</label>
              <select value={form.silhouette} onChange={e => setForm(f => ({ ...f, silhouette: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 outline-none focus:border-accent">
                <option value="">—</option>
                <option value="a_line">A-Line</option>
                <option value="ball_gown">Ball Gown</option>
                <option value="mermaid">Mermaid</option>
                <option value="trumpet">Trumpet</option>
                <option value="sheath">Sheath</option>
                <option value="fit_and_flare">Fit & Flare</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Train Style</label>
              <select value={form.train_style} onChange={e => setForm(f => ({ ...f, train_style: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 outline-none focus:border-accent">
                <option value="">—</option>
                <option value="none">None</option>
                <option value="sweep">Sweep</option>
                <option value="court">Court</option>
                <option value="chapel">Chapel</option>
                <option value="cathedral">Cathedral</option>
                <option value="royal">Royal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-sm p-3 outline-none focus:border-accent" rows={3} placeholder="Describe this gown..." />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Images (JSON array of URLs)</label>
            <textarea value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 text-sm p-3 outline-none focus:border-accent font-mono text-xs" rows={2} placeholder='["https://cdn.shopify.com/..."]' />
          </div>

          {parsedImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {parsedImages.slice(0, 5).map((img: string, i: number) => (
                <div key={i} className="w-16 h-20 bg-slate-100 flex-shrink-0 overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {parsedImages.length > 5 && <p className="text-xs text-slate-400 self-center">+{parsedImages.length - 5} more</p>}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              disabled={isPending || !form.title || !form.price}
              onClick={handleSave}
              className="px-6 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving...' : editId ? 'Update Listing' : 'Create Listing'}
            </button>
            <button onClick={resetForm} className="px-6 py-3 border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {listings.length === 0 && !showForm ? (
        <div className="text-center py-20 bg-white border border-slate-200">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">verified</span>
          <p className="text-sm text-slate-500 font-medium tracking-wide">No Brand Direct Listings Yet</p>
          <p className="text-xs text-slate-400 mt-2">Create listings to sell directly from Galia Lahav</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing: any) => (
            <div key={listing.id} className={`bg-white border border-slate-200 overflow-hidden transition-opacity ${listing.status !== 'approved' ? 'opacity-50' : ''}`}>
              <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-[#1c1c1c] text-white text-[8px] px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">verified</span>
                    Brand Direct
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`text-[8px] px-2 py-0.5 font-bold uppercase tracking-wider ${listing.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                    {listing.status === 'approved' ? 'Live' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <p className="font-serif text-base truncate">{listing.title}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-medium">${listing.price?.toLocaleString()}</span>
                  <span className="text-slate-400">Size {listing.size_us || '—'}</span>
                </div>
                {listing.products?.style_name && (
                  <p className="text-[10px] text-slate-400 truncate">Catalog: {listing.products.style_name}</p>
                )}
                <div className="flex gap-1.5 pt-1">
                  <button disabled={isPending} onClick={() => handleEdit(listing)} className="flex-1 py-1.5 border border-slate-200 text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors disabled:opacity-50">Edit</button>
                  <button disabled={isPending} onClick={() => handleToggle(listing)} className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${listing.status === 'approved' ? 'border border-amber-200 text-amber-600 hover:bg-amber-50' : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                    {listing.status === 'approved' ? 'Hide' : 'Show'}
                  </button>
                  <button disabled={isPending} onClick={() => handleDelete(listing.id)} className="w-8 flex items-center justify-center border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50">
                    <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// BRAND DIRECT MESSAGES TAB
// ═══════════════════════════════════════════════════════
function BrandDirectMessagesTab() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(true);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getBrandDirectConversations().then((d) => {
      setConversations(d);
      if (d.length > 0 && window.innerWidth > 768) {
        openConversation(d[0].id);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!activeConv) return;
    const interval = setInterval(() => {
      getBrandDirectMessages(activeConv).then(setMessages);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConv]);

  const openConversation = (convId: string) => {
    setActiveConv(convId);
    getBrandDirectMessages(convId).then(setMessages);
    if (window.innerWidth <= 768) setShowList(false);
  };

  const handleSend = () => {
    if (!activeConv || !newMsg.trim()) return;
    const msgText = newMsg;
    setNewMsg('');
    startTransition(async () => {
      const res = await adminReplyBrandDirect(activeConv, msgText);
      if (res.success) {
        const updated = await getBrandDirectMessages(activeConv);
        setMessages(updated);
        getBrandDirectConversations().then(setConversations);
      } else if (res.error) {
        setNewMsg(msgText);
      }
    });
  };

  if (loading) return <LoadingSkeleton />;

  const activeConvObj = conversations.find((c: any) => c.id === activeConv);

  function formatDateLabel(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (msgDate.getTime() === today.getTime()) return 'Today';
    if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  }

  const groupedMessages: { date: string; msgs: any[] }[] = [];
  messages.forEach((m) => {
    const label = formatDateLabel(m.created_at);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === label) last.msgs.push(m);
    else groupedMessages.push({ date: label, msgs: [m] });
  });

  const totalUnread = conversations.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between bg-white p-4 border border-slate-200 mb-6">
        <div>
          <h2 className="text-lg font-medium tracking-tight">Brand Direct Messages</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            Buyer inquiries for official Galia Lahav listings
            {totalUnread > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                {totalUnread} unread
              </span>
            )}
          </p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">chat_bubble_outline</span>
          <p className="text-sm text-slate-500 font-medium tracking-wide">No Brand Direct Inquiries Yet</p>
          <p className="text-xs text-slate-400 mt-2">When brides inquire about Brand Direct listings, conversations appear here</p>
        </div>
      ) : (
        <div className="h-[600px] md:h-[700px] bg-[#faf8f5] border border-[#e8e0d4] flex overflow-hidden shadow-2xl shadow-black/8 relative">
          {/* Conversation List */}
          <aside className={`${showList ? 'flex' : 'hidden md:flex'} w-full md:w-[360px] border-r border-[#e8e0d4] flex-col flex-shrink-0 bg-[#faf8f5] z-10`}>
            <div className="px-5 py-4 bg-[#1c1c1c] border-b border-[#333] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/images/SYMBOL_BLACK.png" alt="" className="w-5 h-5 invert opacity-80" />
                <h3 className="text-[13px] font-medium text-white/90 uppercase tracking-[0.15em]">Brand Direct</h3>
              </div>
              <span className="text-[10px] text-white/40 tracking-wider">{conversations.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((c: any) => {
                const isActive = activeConv === c.id;
                const isUnread = c.unreadCount > 0;
                return (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.id)}
                    className={`w-full px-4 py-3.5 text-left border-b border-[#e8e0d4]/60 transition-all duration-200 flex gap-3 items-center ${isActive ? 'bg-[#f0ebe3]' : 'hover:bg-[#f5f0ea]'}`}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-serif tracking-wide relative border"
                      style={{ backgroundColor: isActive ? '#1c1c1c' : '#e8e0d4', color: isActive ? '#faf8f5' : '#8a7e6d', borderColor: isActive ? '#1c1c1c' : '#d4c9b8' }}
                    >
                      {(c.buyer?.display_name || c.buyer?.full_name || 'B').charAt(0).toUpperCase()}
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1c1c1c] rounded-full border-2 border-[#faf8f5] flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-[#c9a96e] rounded-full" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className={`text-[14px] truncate font-serif ${isUnread ? 'font-semibold text-[#1c1c1c]' : 'font-normal text-[#4a4a4a]'}`}>
                          {c.buyer?.display_name || c.buyer?.full_name || 'RE:GALIA Bride'}
                        </p>
                        <span className={`text-[10px] flex-shrink-0 ml-2 uppercase tracking-wider ${isUnread ? 'text-[#c9a96e] font-medium' : 'text-[#b5a898]'}`}>
                          {c.lastMessage ? new Date(c.lastMessage.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <p className={`text-[12px] truncate leading-tight ${isUnread ? 'font-medium text-[#4a4a4a]' : 'text-[#a09585]'}`}>
                        {c.lastMessage?.content || 'No messages yet'}
                      </p>
                      <p className="text-[10px] text-[#b5a898] mt-1 truncate italic">
                        {c.listings?.title}{c.listings?.price ? ` — $${c.listings.price.toLocaleString()}` : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Chat View */}
          <main className={`${!showList ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative overflow-hidden`}>
            {activeConvObj ? (
              <>
                <header className="px-4 md:px-5 py-3 bg-[#1c1c1c] border-b border-[#333] flex items-center justify-between z-20 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowList(true)} className="md:hidden w-8 h-8 flex items-center justify-center text-white/60">
                      <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                    <div className="w-9 h-9 rounded-full bg-[#c9a96e]/20 border border-[#c9a96e]/40 flex items-center justify-center text-[#c9a96e] text-sm font-serif">
                      {(activeConvObj.buyer?.display_name || 'B').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-medium text-white/90 leading-tight font-serif tracking-wide">
                        {activeConvObj.buyer?.display_name || activeConvObj.buyer?.full_name || 'RE:GALIA Bride'}
                      </h4>
                      <p className="text-[11px] text-white/40 truncate max-w-[180px] sm:max-w-none italic">
                        {activeConvObj.listings?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeConvObj.kustomer_conversation_id && (
                      <span className="text-[9px] text-[#c9a96e]/60 uppercase tracking-wider border border-[#c9a96e]/20 px-2 py-1">CRM Linked</span>
                    )}
                  </div>
                </header>

                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-20 py-4 pb-24 relative"
                  style={{
                    backgroundColor: '#f5f0ea',
                    backgroundImage: 'url("/images/SYMBOL_BLACK.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '80px 80px',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'soft-light',
                  }}
                >
                  <div className="absolute inset-0 bg-[#f5f0ea]/[0.92] pointer-events-none" />

                  {groupedMessages.map((group, gi) => (
                    <div key={gi} className="relative z-10">
                      <div className="flex justify-center my-5">
                        <span className="bg-[#1c1c1c]/80 backdrop-blur-sm text-[10px] text-white/70 px-4 py-1.5 uppercase tracking-[0.2em] font-medium">
                          {group.date}
                        </span>
                      </div>
                      {group.msgs.map((m: any, mi: number) => {
                        const isBuyer = m.sender_id === activeConvObj.buyer_id;
                        const isLast = mi === group.msgs.length - 1 || group.msgs[mi + 1]?.sender_id !== m.sender_id;
                        const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div key={m.id} className={`flex ${isBuyer ? 'justify-start' : 'justify-end'} ${isLast ? 'mb-2.5' : 'mb-0.5'}`}>
                            <div className={`relative max-w-[85%] md:max-w-[65%] px-3.5 py-2.5 text-[14px] leading-relaxed ${
                              isBuyer
                                ? 'bg-white text-[#1c1c1c] rounded-2xl rounded-bl-sm shadow-sm border border-[#e8e0d4]'
                                : 'bg-[#1c1c1c] text-white/90 rounded-2xl rounded-br-sm shadow-md'
                            }`}>
                              {isBuyer && (mi === 0 || group.msgs[mi - 1]?.sender_id !== m.sender_id) && (
                                <p className="text-[11px] font-medium text-[#c9a96e] mb-0.5 uppercase tracking-wider">
                                  {activeConvObj.buyer?.display_name || 'Bride'}
                                </p>
                              )}
                              {!isBuyer && (mi === 0 || group.msgs[mi - 1]?.sender_id !== m.sender_id) && (
                                <p className="text-[11px] font-medium text-[#c9a96e] mb-0.5 uppercase tracking-wider">Galia Lahav</p>
                              )}
                              <span className="font-serif">{m.content}</span>
                              <span className="inline-flex items-center gap-1 float-right ml-3 mt-1 translate-y-1">
                                <span className={`text-[10px] whitespace-nowrap ${isBuyer ? 'text-[#b5a898]' : 'text-white/40'}`}>{time}</span>
                                {!isBuyer && (
                                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'wght' 600", color: m.is_read ? '#c9a96e' : 'rgba(255,255,255,0.3)' }}>
                                    done_all
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {isPending && (
                    <div className="flex justify-end mb-2 relative z-10">
                      <div className="bg-[#1c1c1c]/80 px-3.5 py-2.5 rounded-2xl rounded-br-sm shadow-md text-sm text-white/40 italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm animate-spin text-[#c9a96e]">hourglass_top</span>
                        Sending...
                      </div>
                    </div>
                  )}

                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center my-12 relative z-10">
                      <img src="/images/SYMBOL_BLACK.png" alt="" className="w-16 h-16 opacity-10 mb-4" />
                      <span className="bg-[#1c1c1c]/80 backdrop-blur-sm text-[11px] text-white/60 px-5 py-2.5 text-center max-w-sm leading-relaxed tracking-wide">
                        No messages in this conversation yet.
                      </span>
                    </div>
                  )}
                </div>

                <footer className="px-3 md:px-4 py-3 bg-[#1c1c1c] border-t border-[#333] absolute bottom-0 left-0 right-0 z-20">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      placeholder="Reply as Galia Lahav..."
                      className="flex-1 bg-white/10 rounded-none border border-white/10 px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#c9a96e]/50 text-white placeholder-white/30 font-serif transition-colors"
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    />
                    <button
                      onClick={handleSend}
                      disabled={isPending || !newMsg.trim()}
                      className="w-10 h-10 flex items-center justify-center bg-[#c9a96e] text-[#1c1c1c] hover:bg-[#d4b87a] transition-colors disabled:opacity-30 disabled:bg-white/10 disabled:text-white/20 flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'wght' 500" }}>send</span>
                    </button>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center" style={{ backgroundColor: '#f5f0ea' }}>
                <img src="/images/SYMBOL_BLACK.png" alt="RE:GALIA" className="w-24 h-24 opacity-10 mb-8" />
                <h3 className="text-2xl font-serif font-normal text-[#1c1c1c]/70 mb-3 tracking-wide">Brand Direct Inbox</h3>
                <div className="w-12 h-px bg-[#c9a96e]/40 mb-4" />
                <p className="text-[12px] text-[#8a7e6d] max-w-xs leading-relaxed tracking-wide">
                  Select a conversation to view and respond as Galia Lahav
                </p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TRANSACTIONS & LISTINGS TAB (Combined visually)
// ═══════════════════════════════════════════════════════
function TransactionsTab({ mode }: { mode: 'all' | 'transactions' }) {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [seedMsg, setSeedMsg] = useState('');

  const refresh = () => {
    setLoading(true);
    getAllListings(filter).then(d => { setItems(d); setLoading(false); });
  };

  useEffect(() => { refresh(); }, [filter]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;
    startTransition(async () => {
      const res = await deleteListing(id);
      if (res.success) setItems(prev => prev.filter(l => l.id !== id));
    });
  };

  const handleSeed = () => {
    setSeedMsg('Seeding...');
    startTransition(async () => {
      const res = await seedTestListings();
      if (res.success) {
        setSeedMsg(`Created ${res.created} listings (${res.errors} errors)`);
        refresh();
      } else {
        setSeedMsg('Error: ' + (res as any).error);
      }
    });
  };

  const handleClearTest = () => {
    if (!confirm('Delete ALL test/sample listings you created?')) return;
    setSeedMsg('Deleting...');
    startTransition(async () => {
      const res = await deleteAllTestListings();
      if (res.success) {
        setSeedMsg(`Deleted ${res.deleted} test listings`);
        refresh();
      } else {
        setSeedMsg('Error: ' + (res as any).error);
      }
    });
  };

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4 bg-white p-4 border border-slate-200">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-accent focus:border-accent outline-none" placeholder="Search by details..." type="text" />
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <select
            className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="sold">Sold</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          {seedMsg && <span className="text-[10px] text-slate-500">{seedMsg}</span>}
          <button
            disabled={isPending}
            onClick={handleSeed}
            className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            Seed 30 Listings
          </button>
          <button
            disabled={isPending}
            onClick={handleClearTest}
            className="px-4 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
          >
            Clear Test Data
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Seller</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Price</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-mono text-slate-400 group-hover:text-accent transition-colors">#{l.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium">{l.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{l.category}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs">{l.profiles?.display_name || 'Unknown'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium font-mono text-slate-900">${l.price?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{new Date(l.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(l.id)}
                      className="w-8 h-8 inline-flex items-center justify-center border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">No listings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// INVENTORY TAB (Catalog sync / products management)
// ═══════════════════════════════════════════════════════
// (Reusing the comprehensive logic we already have, but styling to match Admin)
function InventoryTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = () => getProducts().then(setProducts);

  useEffect(() => {
    refresh().then(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between gap-4 bg-white p-4 border border-slate-200">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-accent focus:border-accent outline-none" placeholder="Search product catalog..." type="text" />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            disabled={isPending}
            className="px-4 py-2 bg-[#1c1c1c] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#333] transition-all disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                await bulkImportCatalog();
                await refresh();
              });
            }}
          >
            Import Missing
          </button>
          <button
            disabled={isPending}
            className="px-4 py-2 bg-obsidian text-white text-[10px] font-bold uppercase tracking-widest hover:bg-obsidian/80 transition-all disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                await syncCatalogImages();
                await refresh();
              });
            }}
          >
            Sync Images
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 p-4">
            <div className="aspect-[3/4] bg-slate-100 rounded overflow-hidden mb-4 relative">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="bg-white/90 backdrop-blur px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm">{p.category}</span>
              </div>
            </div>
            <p className="font-serif text-lg truncate mb-1">{p.style_name}</p>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{p.sku || 'No SKU'}</span>
              <button
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await toggleProductActive(p.id, !p.is_active);
                    await refresh();
                  })
                }}
                className={`text-[10px] uppercase tracking-widest font-bold ${p.is_active ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {p.is_active ? 'Active' : 'Hidden'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// USERS/SELLERS TAB
// ═══════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getUsers().then(d => { setUsers(d); setLoading(false); });
  }, []);

  const handleRoleChange = (userId: string, role: 'user' | 'moderator' | 'admin') => {
    startTransition(async () => {
      await setUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: role === 'user' ? ['user'] : [role] } : u));
    });
  };

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  return (
    <div className="p-8 space-y-8">
      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">User / Seller</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Joined Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium">{u.display_name || u.full_name || 'No name'}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">ID: {u.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${u.roles?.includes('admin') ? 'bg-purple-100 text-purple-700' :
                      u.roles?.includes('moderator') ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                      {u.roles?.includes('admin') ? 'Admin' : u.roles?.includes('moderator') ? 'Moderator' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="bg-transparent border border-slate-200 rounded text-xs py-1 px-2 focus:border-accent outline-none"
                      value={u.roles?.includes('admin') ? 'admin' : u.roles?.includes('moderator') ? 'moderator' : 'user'}
                      onChange={e => handleRoleChange(u.id, e.target.value as any)}
                      disabled={isPending}
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CLAIMS TAB
// ═══════════════════════════════════════════════════════
function ClaimsTab() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getClaims().then(d => { setClaims(d); setLoading(false); });
  }, []);

  const handleResolve = () => {
    if (!resolveId) return;
    startTransition(async () => {
      await resolveClaim(resolveId, resolveNotes);
      setClaims(prev => prev.map(c => c.id === resolveId ? { ...c, status: 'resolved' } : c));
      setResolveId(null);
      setResolveNotes('');
    });
  };

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  return (
    <div className="p-8 space-y-4">
      {claims.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">shield</span>
          <p className="text-sm text-slate-500 font-medium tracking-wide">No Active Claims</p>
        </div>
      ) : claims.map(claim => (
        <div key={claim.id} className="bg-white border border-slate-200 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-serif text-lg">{claim.reason}</h3>
              <p className="text-xs text-slate-500">Order #{claim.order_id?.slice(0, 8)}</p>
            </div>
            <StatusBadge status={claim.status} />
          </div>
          {claim.description && (
            <p className="text-sm text-slate-600">{claim.description}</p>
          )}

          {claim.status === 'open' && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              {resolveId === claim.id ? (
                <div className="space-y-3">
                  <textarea
                    value={resolveNotes}
                    onChange={e => setResolveNotes(e.target.value)}
                    placeholder="Resolution notes..."
                    className="w-full text-sm p-3 border border-slate-200 bg-slate-50 outline-none focus:border-accent"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button disabled={isPending} onClick={handleResolve} className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-50">Resolve Claim</button>
                    <button disabled={isPending} onClick={() => setResolveId(null)} className="px-4 py-2 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setResolveId(claim.id)}
                  className="text-xs text-accent font-medium tracking-wide"
                >
                  Resolve Dispute →
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// FEATURED GOWNS TAB
// ═══════════════════════════════════════════════════════
function FeaturedGownsTab() {
  const [gowns, setGowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ title: '', subtitle: '', price: '', image_url: '', link: '/shop', listing_id: '' });
  const [approvedListings, setApprovedListings] = useState<any[]>([]);
  const [listingSearch, setListingSearch] = useState('');

  const refresh = () =>
    getFeaturedGowns().then((res: any) => {
      if (res.needsMigration) {
        setNeedsMigration(true);
      } else {
        setGowns(res.data || []);
      }
      setLoading(false);
    });

  useEffect(() => {
    refresh();
    // Load approved listings for the featured gown selector
    getApprovedListingsForSelector().then(res => {
      setApprovedListings(Array.isArray(res) ? res : []);
    });
  }, []);

  const resetForm = () => {
    setForm({ title: '', subtitle: '', price: '', image_url: '', link: '/shop', listing_id: '' });
    setShowForm(false);
    setEditId(null);
  };

  const handleSelectListing = (listing: any) => {
    const condMap: Record<string, string> = { new_unworn: 'New Never Worn', excellent: 'Excellent', good: 'Good' };
    const cond = condMap[listing.condition] || listing.condition || 'Excellent';
    const img = listing.images?.[0] || listing.products?.images?.[0] || '';
    setForm({
      title: listing.title,
      subtitle: `Size ${listing.size_us || '—'} • ${cond}`,
      price: `$${(listing.price || 0).toLocaleString()}`,
      image_url: img,
      link: `/shop/${listing.id}`,
      listing_id: listing.id
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      if (editId) {
        await updateFeaturedGown(editId, form);
      } else {
        await addFeaturedGown(form);
      }
      resetForm();
      await refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await removeFeaturedGown(id);
      await refresh();
    });
  };

  const handleReorder = (id: string, direction: 'up' | 'down') => {
    startTransition(async () => {
      await reorderFeaturedGown(id, direction);
      await refresh();
    });
  };

  const handleEdit = (gown: any) => {
    setForm({
      title: gown.title,
      subtitle: gown.subtitle || '',
      price: gown.price || '',
      image_url: gown.image_url || '',
      link: gown.link || '/shop',
      listing_id: gown.listing_id || '',
    });
    setEditId(gown.id);
    setShowForm(true);
  };

  const handleToggle = (gown: any) => {
    startTransition(async () => {
      await updateFeaturedGown(gown.id, { is_active: !gown.is_active });
      await refresh();
    });
  };

  if (loading) return <div className="p-8"><LoadingSkeleton /></div>;

  if (needsMigration) {
    return (
      <div className="p-8 space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-8">
          <h3 className="text-xl font-medium mb-4">Database Setup Required</h3>
          <p className="text-sm text-slate-600 mb-6">
            Run this SQL in your Supabase Dashboard &gt; SQL Editor to create the featured_gowns table:
          </p>
          <pre className="bg-white border border-slate-200 p-4 text-xs font-mono overflow-x-auto whitespace-pre">
            {`CREATE TABLE featured_gowns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  price text,
  image_url text,
  link text DEFAULT '/shop',
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE featured_gowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON featured_gowns
  FOR SELECT USING (true);

CREATE POLICY "Admin write" ON featured_gowns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','moderator'))
  );`}
          </pre>
          <button onClick={() => { setNeedsMigration(false); setLoading(true); refresh(); }} className="mt-6 px-6 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 border border-slate-200">
        <div>
          <h2 className="text-lg font-medium tracking-tight">Featured Gowns</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            These appear on the homepage carousel • {gowns.length} gowns configured
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-6 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Gown
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium tracking-tight">{editId ? 'Edit Gown' : 'Add New Featured Gown'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Listing Selector */}
          <div className="bg-blue-50 border border-blue-200 p-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 block">
              Select from Approved Listings ({approvedListings.length})
            </label>
            <input
              value={listingSearch}
              onChange={e => setListingSearch(e.target.value)}
              className="w-full bg-white border border-blue-300 text-sm py-2 px-3 focus:ring-accent focus:border-accent outline-none mb-2"
              placeholder="Search by title, size, or price..."
            />
            <div className="max-h-60 overflow-y-auto bg-white border border-blue-200 divide-y divide-slate-100">
              {approvedListings
                .filter(l => {
                  if (!listingSearch) return true;
                  const q = listingSearch.toLowerCase();
                  return (
                    l.title?.toLowerCase().includes(q) ||
                    String(l.size_us || '').includes(q) ||
                    String(l.price || '').includes(q) ||
                    (l.products?.style_name || '').toLowerCase().includes(q)
                  );
                })
                .slice(0, 50)
                .map((listing: any) => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => { handleSelectListing(listing); setListingSearch(''); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-blue-50 transition-colors ${form.listing_id === listing.id ? 'bg-blue-100' : ''}`}
                  >
                    <div className="w-10 h-12 bg-slate-100 flex-shrink-0 overflow-hidden">
                      {listing.images?.[0] && <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{listing.title}</p>
                      <p className="text-[10px] text-slate-500">
                        Size {listing.size_us || '—'} • ${(listing.price || 0).toLocaleString()} • {listing.products?.style_name || 'Couture'}
                      </p>
                    </div>
                    {form.listing_id === listing.id && (
                      <span className="material-symbols-outlined text-blue-600 text-sm">check_circle</span>
                    )}
                  </button>
                ))}
              {approvedListings.length === 0 && (
                <p className="text-xs text-slate-400 p-3 text-center">No approved listings found</p>
              )}
            </div>
            <p className="text-[10px] text-blue-500 mt-2">
              Select a listing to auto-fill, or enter details manually below
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 focus:ring-accent focus:border-accent outline-none"
                placeholder="The Maya"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Subtitle</label>
              <input
                value={form.subtitle}
                onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 focus:ring-accent focus:border-accent outline-none"
                placeholder="Size 4 • Excellent Condition"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Price</label>
              <input
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 focus:ring-accent focus:border-accent outline-none"
                placeholder="$4,200"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Link</label>
              <input
                value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 focus:ring-accent focus:border-accent outline-none"
                placeholder="/shop or /shop/uuid"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Image URL</label>
            <input
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 text-sm py-2 px-3 focus:ring-accent focus:border-accent outline-none"
              placeholder="https://cdn.shopify.com/..."
            />
          </div>
          {form.image_url && (
            <div className="w-24 h-32 bg-slate-100 overflow-hidden">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              disabled={isPending || !form.title || !form.image_url}
              onClick={handleSave}
              className="px-6 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {editId ? 'Update' : 'Add to Carousel'}
            </button>
            <button onClick={resetForm} className="px-6 py-3 border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gowns list */}
      {gowns.length === 0 && !showForm ? (
        <div className="text-center py-20 bg-white border border-slate-200">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">collections</span>
          <p className="text-sm text-slate-500 font-medium tracking-wide">No Featured Gowns Yet</p>
          <p className="text-xs text-slate-400 mt-2">Add gowns to display on the homepage carousel</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gowns.map((gown, idx) => (
            <div key={gown.id} className={`bg-white border border-slate-200 p-4 flex items-center gap-6 transition-all ${!gown.is_active ? 'opacity-50' : ''}`}>
              {/* Order controls */}
              <div className="flex flex-col gap-1">
                <button
                  disabled={isPending || idx === 0}
                  onClick={() => handleReorder(gown.id, 'up')}
                  className="w-7 h-7 flex items-center justify-center border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">expand_less</span>
                </button>
                <button
                  disabled={isPending || idx === gowns.length - 1}
                  onClick={() => handleReorder(gown.id, 'down')}
                  className="w-7 h-7 flex items-center justify-center border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">expand_more</span>
                </button>
              </div>

              {/* Image */}
              <div className="w-16 h-20 bg-slate-100 flex-shrink-0 overflow-hidden">
                {gown.image_url ? (
                  <img src={gown.image_url} alt={gown.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined">image</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{gown.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{gown.subtitle}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-medium font-mono">{gown.price}</span>
                  <span className="text-[10px] text-slate-400">{gown.link}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  disabled={isPending}
                  onClick={() => handleToggle(gown)}
                  className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 transition-colors ${gown.is_active ? 'text-emerald-500 hover:text-emerald-700' : 'text-red-500 hover:text-red-700'}`}
                >
                  {gown.is_active ? 'Active' : 'Hidden'}
                </button>
                <button
                  disabled={isPending}
                  onClick={() => handleEdit(gown)}
                  className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-slate-500">edit</span>
                </button>
                <button
                  disabled={isPending}
                  onClick={() => handleDelete(gown.id)}
                  className="w-8 h-8 flex items-center justify-center border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// SHARED UI
// ═══════════════════════════════════════════════════════
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_review: 'bg-amber-50 text-amber-600',
    approved: 'bg-emerald-50 text-emerald-600',
    rejected: 'bg-red-50 text-red-600',
    sold: 'bg-blue-50 text-blue-600',
    draft: 'bg-slate-50 text-slate-600',
    archived: 'bg-slate-100 text-slate-400',
    open: 'bg-amber-50 text-amber-600',
    resolved: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${styles[status] || styles.draft} text-[9px] font-bold uppercase tracking-widest`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 bg-slate-100 animate-pulse rounded" />
      <div className="h-32 bg-slate-100 animate-pulse rounded" />
    </div>
  );
}


// ═══════════════════════════════════════════════════════
// MAIN PAGE LAYOUT
// ═══════════════════════════════════════════════════════
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getAdminStats()
      .then(() => setAuthorized(true))
      .catch(() => setAuthorized(false));
  }, []);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse font-sans text-slate-400 tracking-widest uppercase text-sm">Verifying access...</div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-12 bg-white shadow-xl max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="font-serif text-2xl text-slate-900 mb-2">Access Restricted</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Admin console is restricted to authorized personnel. Return to the marketplace.</p>
          <Link href="/" className="px-8 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleTab = (t: Tab) => {
    setTab(t);
    setSidebarOpen(false);
  };

  const T: Record<Tab, string> = {
    dashboard: 'Dashboard',
    moderation: 'Moderation Queue',
    brand_direct: 'Brand Direct',
    brand_messages: 'Brand Messages',
    inventory: 'Inventory Catalog',
    sellers: 'Sellers & Users',
    transactions: 'All Transactions',
    claims: 'Dispute Claims',
    featured: 'Featured Gowns'
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col md:flex-row">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[59] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Layout */}
      <aside className={`fixed md:sticky left-0 top-0 h-full w-64 border-r border-slate-200 bg-white z-[60] flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-medium tracking-widest uppercase border-b border-slate-100 pb-6 mb-8 cursor-pointer" onClick={() => window.location.href = '/'}>
            Galia Lahav
            <span className="block text-[10px] tracking-[0.3em] mt-1 text-slate-400">ADMIN CONSOLE</span>
          </h1>
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            <button onClick={() => handleTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'dashboard' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span className="text-xs font-medium tracking-wider uppercase">Dashboard</span>
            </button>
            <button onClick={() => handleTab('moderation')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'moderation' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-xs font-medium tracking-wider uppercase">Moderation</span>
            </button>
            <button onClick={() => handleTab('brand_direct')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'brand_direct' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">verified</span>
              <span className="text-xs font-medium tracking-wider uppercase">Brand Direct</span>
            </button>
            <button onClick={() => handleTab('brand_messages')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'brand_messages' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">chat</span>
              <span className="text-xs font-medium tracking-wider uppercase">Messages</span>
            </button>
            <button onClick={() => handleTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'inventory' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">inventory_2</span>
              <span className="text-xs font-medium tracking-wider uppercase">Inventory</span>
            </button>
            <button onClick={() => handleTab('sellers')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'sellers' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">people_outline</span>
              <span className="text-xs font-medium tracking-wider uppercase">Sellers</span>
            </button>
            <button onClick={() => handleTab('transactions')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'transactions' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">payments</span>
              <span className="text-xs font-medium tracking-wider uppercase">Transactions</span>
            </button>
            <button onClick={() => handleTab('claims')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'claims' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">shield</span>
              <span className="text-xs font-medium tracking-wider uppercase">Claims</span>
            </button>
            <div className="h-px bg-slate-100 my-2"></div>
            <button onClick={() => handleTab('featured')} className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${tab === 'featured' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-sm">star</span>
              <span className="text-xs font-medium tracking-wider uppercase">Featured</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto w-full p-8 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">A</div>
            <div>
              <p className="text-xs font-semibold">Admin User</p>
              <Link href="/dashboard" className="text-[10px] text-accent hover:underline uppercase tracking-tighter">Exit Admin</Link>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen relative">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-[58]">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-slate-500"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-[10px] md:text-xs text-slate-400 tracking-widest uppercase">Console</span>
            <span className="h-4 w-px bg-slate-200"></span>
            <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-slate-800 truncate max-w-[120px] md:max-w-none">{T[tab]}</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors text-sm">storefront</Link>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden">
          {tab === 'dashboard' && <OverviewTab />}
          <div className={tab === 'moderation' ? 'block h-full' : 'hidden h-full'}>
            <ModerationTab />
          </div>
          {tab === 'brand_direct' && <BrandDirectTab />}
          {tab === 'brand_messages' && <BrandDirectMessagesTab />}
          {tab === 'inventory' && <InventoryTab />}
          {tab === 'sellers' && <UsersTab />}
          <div className={tab === 'transactions' ? 'block' : 'hidden'}>
            <TransactionsTab mode="all" />
          </div>
          {tab === 'claims' && <ClaimsTab />}
          {tab === 'featured' && <FeaturedGownsTab />}
        </div>
      </div>
    </div>
  );
}
