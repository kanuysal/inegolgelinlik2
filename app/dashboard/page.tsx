"use client";

import { useState, useEffect, useTransition, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { thumb } from "@/lib/image";
import { InlineLoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  getMyListings,
  deleteListing,
  unpublishListing,
  republishListing,
  getMyPurchases,
  getMySales,
  getMyConversations,
  getConversationMessages,
  sendMessage,
  getMyProfile,
  updateProfile,
  getMyNotifications,
  markNotificationRead,
} from "./actions";
import { getApprovedListings } from "@/app/shop/actions";
import { useWishlist } from "@/lib/wishlist-context";

type Tab = "listings" | "purchases" | "messages" | "wishlist" | "profile";

/* ── Loading Skeleton ── */
function LoadingSkeleton() {
  return <InlineLoadingSpinner size="md" />;
}

/* ══════════════════════════════════════════════════
   MY LISTINGS TAB
   ══════════════════════════════════════════════════ */
function ListingsTab() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getMyListings().then((d) => {
      setListings(d);
      setLoading(false);
    });
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteListing(id);
      if (res.success) {
        setListings((prev) => prev.filter((l) => l.id !== id));
        toast.success('Listing deleted successfully!');
      } else if (res.error) {
        toast.error('Error deleting: ' + res.error);
      }
    });
  };

  const handleUnpublish = (id: string) => {
    startTransition(async () => {
      try {
        const res = await unpublishListing(id);
        if (res?.success) {
          setListings((prev) =>
            prev.map((l) => (l.id === id ? { ...l, status: 'archived' } : l))
          );
          toast.success('Listing unpublished successfully!');
        } else if (res?.error) {
          toast.error('Error unpublishing: ' + res.error);
        } else {
          toast.error('Unexpected response: ' + JSON.stringify(res));
        }
      } catch (error: any) {
        toast.error('Exception during unpublish: ' + error.message);
      }
    });
  };

  const handleRepublish = (id: string) => {
    startTransition(async () => {
      const res = await republishListing(id);
      if (res.success) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: 'approved' } : l))
        );
        toast.success('Listing republished successfully!');
      } else if (res.error) {
        toast.error('Error republishing: ' + res.error);
      }
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-[1600px] mx-auto pt-4 md:pt-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 md:mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-light mb-2">My Listings</h2>
          <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.2em]">Manage your bridal collection</p>
        </div>
        <Link href="/sell/submit" className="w-full md:w-auto bg-primary text-white px-8 py-4 md:py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/5">
          <span className="material-symbols-outlined text-sm">add</span>
          Create New Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {listings.map((listing: any) => (
          <div key={listing.id} className="listing-card group flex flex-col bg-white border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img alt={listing.title} className="listing-image w-full h-full object-cover transition-transform duration-700" src={listing.images?.[0] || 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Lorena_-_Studio_-_Ai.jpg'} />
              <div className="absolute top-3 left-3 md:top-4 md:left-4">
                <span className={`border px-3 py-1 text-[8px] md:text-[9px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm ${listing.status === 'approved' ? 'bg-green-500 text-white border-green-500' :
                  listing.status === 'archived' ? 'bg-gray-500 text-white border-gray-500' :
                    listing.status === 'pending_review' ? 'bg-amber-500 text-white border-amber-500' :
                      listing.status === 'rejected' ? 'bg-red-500 text-white border-red-500' :
                        'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>
                  {listing.status === 'pending_review' ? 'PENDING' :
                    listing.status === 'archived' ? 'ARCHIVED' :
                      listing.status || 'DRAFT'}
                </span>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
                <Link
                  href={`/shop/${listing.id}`}
                  className="w-12 h-12 rounded-full bg-white shadow-lg text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-all hover:scale-110"
                  title="View listing"
                >
                  <span className="material-symbols-outlined text-xl">visibility</span>
                </Link>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-light">{listing.title}</h3>
                <span className="text-sm font-medium">${listing.price?.toLocaleString() || '0'}</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-6">{listing.category} • {listing.size_us || 'Custom Size'}</p>

              {listing.rejection_reason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200">
                  <p className="text-red-600 text-[11px] font-sans leading-relaxed font-light">
                    <span className="font-medium uppercase mr-2">Issue:</span> {listing.rejection_reason}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(listing.status === "draft" || listing.status === "rejected") && (
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={isPending}
                      className="text-red-400 text-[9px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                  {listing.status === "approved" && (
                    <button
                      onClick={() => handleUnpublish(listing.id)}
                      disabled={isPending}
                      className="text-amber-600 text-[9px] font-bold uppercase tracking-widest hover:text-amber-800 transition-colors disabled:opacity-50"
                    >
                      Unpublish
                    </button>
                  )}
                  {listing.status === "archived" && (
                    <>
                      <button
                        onClick={() => handleRepublish(listing.id)}
                        disabled={isPending}
                        className="text-green-600 text-[9px] font-bold uppercase tracking-widest hover:text-green-800 transition-colors disabled:opacity-50"
                      >
                        Republish
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={isPending}
                        className="text-red-400 text-[9px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
                <Link href={`/shop/${listing.id}`} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors flex items-center gap-1">
                  View Details
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        ))}

        <div className="listing-card group flex flex-col bg-slate-50 border border-dashed border-slate-200 transition-all duration-500 hover:border-accent">
          <Link href="/sell/submit" className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-accent">add</span>
            </div>
            <h3 className="text-lg font-light mb-2">Sell your Gown</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-8 max-w-[200px]">Turn your beautiful memories into another bride's dream.</p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent border border-accent/20 px-6 py-2 rounded-full hover:bg-accent hover:text-white transition-all">
              Get Started
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MY PURCHASES / SALES TAB
   ══════════════════════════════════════════════════ */
function PurchasesTab() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyPurchases(), getMySales()]).then(([p, s]) => {
      setPurchases(p);
      setSales(s);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-[1400px] mx-auto pt-4 md:pt-8">
      <header className="mb-10 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-light mb-2">My Orders</h2>
        <p className="text-slate-400 text-sm">Manage your purchases and track your sales activity.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
        <section>
          <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-slate-100">
            <h3 className="text-xl font-medium tracking-tight">Purchases</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{purchases.length}</span>
          </div>
          <div className="space-y-4 md:space-y-6">
            {purchases.map((order: any) => (
              <div key={order.id} className="bg-white border border-slate-200 p-5 md:p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 md:p-4">
                  <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-slate-400">Order #{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                  <div className="w-20 h-24 bg-slate-100 flex-shrink-0">
                    {order.listings?.images?.[0] ? (
                      <img src={order.listings.images[0]} alt="" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-base md:text-lg">{order.listings?.title || "Signature Couture"}</h4>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full">{order.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-sm font-medium">${order.total?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-[11px] md:text-xs text-slate-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {order.tracking_number && (
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Tracking Number (FedEx)</p>
                          <p className="text-xs font-mono">{order.tracking_number}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {purchases.length === 0 && (
              <p className="text-sm text-slate-400">You haven't purchased anything yet.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 border-b border-slate-100">
            <h3 className="text-xl font-medium tracking-tight">Sales</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{sales.length}</span>
          </div>
          <div className="space-y-4 md:space-y-6">
            {sales.map((order: any) => (
              <div key={order.id} className="bg-white border border-slate-200 p-5 md:p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 md:p-4">
                  <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-slate-400">Order #{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                  <div className="w-20 h-24 bg-slate-100 flex-shrink-0">
                    {order.listings?.images?.[0] ? (
                      <img src={order.listings.images[0]} alt="" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-base md:text-lg">{order.listings?.title || "Signature Couture"}</h4>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full">{order.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest mb-1">Net Payout</p>
                        <p className="text-sm font-medium">${order.seller_payout?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-[11px] md:text-xs text-slate-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-sm text-slate-400">You haven't sold anything yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MESSAGES TAB — WhatsApp-style chat
   ══════════════════════════════════════════════════ */

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDate.getTime() === today.getTime()) return "Today";
  if (msgDate.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function MessagesTab() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(true);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMyConversations().then((d) => {
      setConversations(d);
      if (d.length > 0 && window.innerWidth > 768) {
        openConversation(d[0].id);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Poll for new messages every 5 seconds when a conversation is open
  useEffect(() => {
    if (!activeConv) return;
    const interval = setInterval(() => {
      getConversationMessages(activeConv).then(setMessages);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConv]);

  const openConversation = (convId: string) => {
    setActiveConv(convId);
    getConversationMessages(convId).then(setMessages);
    if (window.innerWidth <= 768) {
      setShowList(false);
    }
  };

  const handleSend = () => {
    if (!activeConv || !newMsg.trim()) return;
    const msgText = newMsg;
    setNewMsg("");
    startTransition(async () => {
      const res = await sendMessage(activeConv, msgText);
      if (res.success) {
        const updated = await getConversationMessages(activeConv);
        setMessages(updated);
        // Refresh conversations list to update last message preview
        getMyConversations().then(setConversations);
      } else if (res.error) {
        setNewMsg(msgText);
        toast.error("Failed to send: " + res.error);
      }
    });
  };

  if (loading) return <LoadingSkeleton />;

  const activeConvObj = conversations.find((c) => c.id === activeConv);

  // Group messages by date for date separators
  const groupedMessages: { date: string; msgs: any[] }[] = [];
  messages.forEach((m) => {
    const label = formatDateLabel(m.created_at);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === label) {
      last.msgs.push(m);
    } else {
      groupedMessages.push({ date: label, msgs: [m] });
    }
  });

  return (
    <div className="max-w-[1400px] mx-auto h-[600px] md:h-[700px] bg-[#faf8f5] border border-[#e8e0d4] flex overflow-hidden shadow-2xl shadow-black/8 relative">
      {/* Conversations List */}
      <aside className={`${showList ? "flex" : "hidden md:flex"} w-full md:w-[360px] border-r border-[#e8e0d4] flex-col flex-shrink-0 bg-[#faf8f5] z-10`}>
        <div className="px-5 py-4 bg-[#1c1c1c] border-b border-[#333] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/images/SYMBOL_BLACK.png" alt="" className="w-5 h-5 invert opacity-80" />
            <h3 className="text-[13px] font-medium text-white/90 uppercase tracking-[0.15em]">Messages</h3>
          </div>
          <span className="text-[10px] text-white/40 tracking-wider">{conversations.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => {
            const lastMsg = c.messages?.[0];
            const isUnread = lastMsg && !lastMsg.is_read && lastMsg.sender_id === c.otherPerson?.id;
            const isActive = activeConv === c.id;

            return (
              <button
                key={c.id}
                onClick={() => openConversation(c.id)}
                className={`w-full px-4 py-3.5 text-left border-b border-[#e8e0d4]/60 transition-all duration-200 flex gap-3 items-center ${isActive ? "bg-[#f0ebe3]" : "hover:bg-[#f5f0ea]"}`}
              >
                <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-serif tracking-wide relative border"
                  style={{ backgroundColor: isActive ? "#1c1c1c" : "#e8e0d4", color: isActive ? "#faf8f5" : "#8a7e6d", borderColor: isActive ? "#1c1c1c" : "#d4c9b8" }}
                >
                  {(c.otherPerson?.display_name || "U").charAt(0).toUpperCase()}
                  {isUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1c1c1c] rounded-full border-2 border-[#faf8f5] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-[#c9a96e] rounded-full" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`text-[14px] truncate font-serif ${isUnread ? "font-semibold text-[#1c1c1c]" : "font-normal text-[#4a4a4a]"}`}>
                      {c.otherPerson?.display_name || "RE:GALIA Bride"}
                    </p>
                    <span className={`text-[10px] flex-shrink-0 ml-2 uppercase tracking-wider ${isUnread ? "text-[#c9a96e] font-medium" : "text-[#b5a898]"}`}>
                      {lastMsg ? new Date(lastMsg.created_at).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {lastMsg && lastMsg.sender_id !== c.otherPerson?.id && (
                      <span className="material-symbols-outlined text-[13px] text-[#c9a96e] flex-shrink-0" style={{ fontVariationSettings: "'wght' 600" }}>
                        {lastMsg.is_read ? "done_all" : "done_all"}
                      </span>
                    )}
                    <p className={`text-[12px] truncate leading-tight ${isUnread ? "font-medium text-[#4a4a4a]" : "text-[#a09585]"}`}>
                      {lastMsg?.content || "No messages yet"}
                    </p>
                  </div>
                  <p className="text-[10px] text-[#b5a898] mt-1 truncate italic">
                    {c.listings?.title}
                  </p>
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-10 text-center text-[#b5a898] text-sm">
              <img src="/images/SYMBOL_BLACK.png" alt="" className="w-12 h-12 mx-auto mb-4 opacity-15" />
              <p className="font-serif text-[#8a7e6d]">No conversations yet</p>
            </div>
          )}
        </div>
      </aside>

      {/* Message View */}
      <main className={`${!showList ? "flex" : "hidden md:flex"} flex-1 flex-col relative overflow-hidden`}>
        {activeConvObj ? (
          <>
            {/* Header */}
            <header className="px-4 md:px-5 py-3 bg-[#1c1c1c] border-b border-[#333] flex items-center justify-between z-20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowList(true)} className="md:hidden w-8 h-8 flex items-center justify-center text-white/60">
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <div className="w-9 h-9 rounded-full bg-[#c9a96e]/20 border border-[#c9a96e]/40 flex items-center justify-center text-[#c9a96e] text-sm font-serif">
                  {(activeConvObj.otherPerson?.display_name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-[14px] font-medium text-white/90 leading-tight font-serif tracking-wide">
                    {activeConvObj.otherPerson?.display_name || "RE:GALIA Bride"}
                  </h4>
                  <p className="text-[11px] text-white/40 truncate max-w-[180px] sm:max-w-none italic">
                    {activeConvObj.listings?.title}
                  </p>
                </div>
              </div>
              <Link
                href={`/shop/${activeConvObj.listing_id}`}
                className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/50 hover:text-[#c9a96e] transition-colors px-3 py-1.5 border border-white/10 hover:border-[#c9a96e]/30"
              >
                <span className="material-symbols-outlined text-sm">storefront</span>
                <span className="hidden sm:inline">View Listing</span>
              </Link>
            </header>

            {/* Chat area with luxury wallpaper */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-20 py-4 pb-24 relative"
              style={{
                backgroundColor: "#f5f0ea",
                backgroundImage: `url("/images/SYMBOL_BLACK.png")`,
                backgroundRepeat: "repeat",
                backgroundSize: "80px 80px",
                backgroundPosition: "center",
                backgroundBlendMode: "soft-light",
              }}
            >
              {/* Subtle overlay to soften the logo pattern */}
              <div className="absolute inset-0 bg-[#f5f0ea]/[0.92] pointer-events-none" />
              {groupedMessages.map((group, gi) => (
                <div key={gi} className="relative z-10">
                  {/* Date separator */}
                  <div className="flex justify-center my-5">
                    <span className="bg-[#1c1c1c]/80 backdrop-blur-sm text-[10px] text-white/70 px-4 py-1.5 uppercase tracking-[0.2em] font-medium">
                      {group.date}
                    </span>
                  </div>

                  {/* Messages */}
                  {group.msgs.map((m, mi) => {
                    const isMine = m.sender_id !== activeConvObj.otherPerson?.id;
                    const isLast = mi === group.msgs.length - 1 || group.msgs[mi + 1]?.sender_id !== m.sender_id;
                    const time = new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} ${isLast ? "mb-2.5" : "mb-0.5"}`}>
                        <div
                          className={`relative max-w-[85%] md:max-w-[65%] px-3.5 py-2.5 text-[14px] leading-relaxed ${
                            isMine
                              ? "bg-[#1c1c1c] text-white/90 rounded-2xl rounded-br-sm shadow-md"
                              : "bg-white text-[#1c1c1c] rounded-2xl rounded-bl-sm shadow-sm border border-[#e8e0d4]"
                          }`}
                        >
                          {/* Sender label for first message in group from other person */}
                          {!isMine && (mi === 0 || group.msgs[mi - 1]?.sender_id !== m.sender_id) && (
                            <p className="text-[11px] font-medium text-[#c9a96e] mb-0.5 uppercase tracking-wider">
                              {activeConvObj.otherPerson?.display_name || "Seller"}
                            </p>
                          )}

                          {/* Message content + inline time */}
                          <span className="font-serif">{m.content}</span>
                          <span className="inline-flex items-center gap-1 float-right ml-3 mt-1 translate-y-1">
                            <span className={`text-[10px] whitespace-nowrap ${isMine ? "text-white/40" : "text-[#b5a898]"}`}>{time}</span>
                            {isMine && (
                              <span
                                className="material-symbols-outlined text-[14px]"
                                style={{ fontVariationSettings: "'wght' 600", color: m.is_read ? "#c9a96e" : "rgba(255,255,255,0.3)" }}
                              >
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
                    Your messages are managed by RE:GALIA. Send a message to begin.
                  </span>
                </div>
              )}
            </div>

            {/* Input footer */}
            <footer className="px-3 md:px-4 py-3 bg-[#1c1c1c] border-t border-[#333] absolute bottom-0 left-0 right-0 z-20">
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 rounded-none border border-white/10 px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#c9a96e]/50 text-white placeholder-white/30 font-serif transition-colors"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={isPending || !newMsg.trim()}
                  className="w-10 h-10 bg-[#c9a96e] text-[#1c1c1c] flex items-center justify-center hover:bg-[#d4b87a] transition-colors disabled:opacity-30 disabled:bg-white/10 disabled:text-white/20 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'wght' 500" }}>send</span>
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center" style={{ backgroundColor: "#f5f0ea" }}>
            <img src="/images/SYMBOL_BLACK.png" alt="RE:GALIA" className="w-24 h-24 opacity-10 mb-8" />
            <h3 className="text-2xl font-serif font-normal text-[#1c1c1c]/70 mb-3 tracking-wide">RE:GALIA Messages</h3>
            <div className="w-12 h-px bg-[#c9a96e]/40 mb-4" />
            <p className="text-[12px] text-[#8a7e6d] max-w-xs leading-relaxed tracking-wide">
              Select a conversation to view your messages. Send inquiries from any listing page.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PROFILE TAB
   ══════════════════════════════════════════════════ */
function ProfileTab() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyProfile().then((d) => {
      setProfile(d);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.target as HTMLFormElement);
    const res = await updateProfile(form);
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-16">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-slate-100 p-1 mb-4 md:mb-6 bg-slate-50">
                {profile?.avatar_url ? (
                  <img
                    alt="User Avatar"
                    className="w-full h-full object-cover rounded-full"
                    src={profile.avatar_url}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl md:text-5xl font-light">
                    {(profile?.display_name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-light mb-1 italic">{profile?.display_name || "Bridal User"}</h2>
            <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-slate-400 mb-4 md:mb-8">Member since {new Date(profile?.created_at || Date.now()).getFullYear()}</p>
          </div>
        </aside>

        <section className="flex-1 w-full">
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 md:mb-12 pb-4 border-b border-slate-100">
              <h3 className="text-2xl md:text-3xl font-light">Personal Details</h3>
              <button type="submit" disabled={saving} className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-accent hover:text-primary transition-colors disabled:opacity-50 text-left sm:text-right">
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-10">
              <div className="space-y-1">
                <label className="label-luxe">Full Name</label>
                <input name="full_name" defaultValue={profile?.full_name || ""} className="form-input-luxe" type="text" placeholder="Your Full Name" />
              </div>
              <div className="space-y-1">
                <label className="label-luxe">Display Name</label>
                <input name="display_name" defaultValue={profile?.display_name || ""} className="form-input-luxe" type="text" placeholder="Name shown to others" />
              </div>
              <div className="space-y-1">
                <label className="label-luxe">Email Address</label>
                <input name="email" value={profile?.email || ""} disabled className="form-input-luxe opacity-60" type="email" />
              </div>
              <div className="space-y-1">
                <label className="label-luxe">Phone Number</label>
                <input name="phone" defaultValue={profile?.phone || ""} className="form-input-luxe" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div className="pt-8 md:pt-12 flex flex-col sm:flex-row justify-end gap-4 md:gap-6">
              <button type="submit" disabled={saving} className="w-full sm:w-auto px-10 py-4 md:py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-lg shadow-primary/5 disabled:opacity-50">
                {saving ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   WISHLIST TAB
   ══════════════════════════════════════════════════ */
function WishlistTab() {
  const { ids, toggle } = useWishlist();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setListings([]);
      setLoading(false);
      return;
    }
    getApprovedListings().then((data) => {
      if (data) {
        setListings(data.filter((l: any) => ids.includes(l.id)));
      }
      setLoading(false);
    });
  }, [ids]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-[1600px] mx-auto pt-4 md:pt-8">
      <div className="mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-light mb-1 md:mb-2">My Wishlist</h2>
        <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.2em]">
          {listings.length} {listings.length === 1 ? "gown" : "gowns"} saved
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 md:py-20">
          <span className="material-symbols-outlined text-4xl md:text-5xl text-slate-200 mb-4 block">favorite_border</span>
          <p className="text-slate-400 mb-2 font-light">Your wishlist is empty</p>
          <p className="text-[10px] md:text-xs text-slate-300 mb-8 font-light uppercase tracking-widest">Tap the heart on any gown to save it here.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 md:py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all">
            Browse Gowns
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {listings.map((listing: any) => {
            const image = thumb(listing.images?.[0] || listing.products?.images?.[0]);
            const msrp = listing.msrp || listing.products?.msrp;
            const conditionMap: Record<string, string> = {
              new_unworn: "New Never Worn",
              excellent: "Excellent",
              good: "Good",
            };
            return (
              <div key={listing.id} className="group flex flex-col bg-white border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5">
                <Link href={`/shop/${listing.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                    <img alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={image} />
                  </div>
                </Link>
                <div className="p-5 md:p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <Link href={`/shop/${listing.id}`}>
                      <h3 className="text-lg font-normal tracking-tight font-serif hover:text-accent transition-colors">{listing.title}</h3>
                    </Link>
                    {listing.size_us && (
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter ml-2">SIZE {listing.size_us}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">
                    {conditionMap[listing.condition] || "Excellent"}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-baseline gap-2">
                      <p className="text-base font-bold tracking-tight">${listing.price?.toLocaleString()}</p>
                      {msrp && msrp > listing.price && (
                        <p className="text-xs text-slate-300 line-through">${msrp.toLocaleString()}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggle(listing.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ══════════════════════════════════════════════════ */
function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "listings";
  const [tab, setTab] = useState<Tab>(initialTab);

  const tabs: { key: Tab; label: string }[] = [
    { key: "listings", label: "Listings" },
    { key: "purchases", label: "Orders" },
    { key: "messages", label: "Messages" },
    { key: "wishlist", label: "Wishlist" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      <Toaster position="top-right" />
      <Navbar />

      <div className="pt-24 md:pt-32 pb-10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="mb-8 md:mb-12">
            <h1 className="text-4xl md:text-7xl font-light tracking-tighter mb-2 md:mb-4">Account</h1>
            <p className="text-[10px] md:text-sm text-slate-400 uppercase tracking-[0.3em]">Signature Marketplace • Dashboard</p>
          </div>

          <div className="flex overflow-x-auto no-scrollbar border-b border-slate-100 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
            <nav className="flex gap-8 md:gap-12 min-w-max">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`pb-4 text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase transition-colors relative whitespace-nowrap ${tab === t.key ? "text-primary" : "text-slate-400 hover:text-accent"}`}
                >
                  {t.label}
                  {tab === t.key && (
                    <motion.div
                      layoutId="dashboard-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4 md:mt-8">
            {tab === "listings" && <ListingsTab />}
            {tab === "purchases" && <PurchasesTab />}
            {tab === "messages" && <MessagesTab />}
            {tab === "wishlist" && <WishlistTab />}
            {tab === "profile" && <ProfileTab />}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
