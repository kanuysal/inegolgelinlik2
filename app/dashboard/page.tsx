"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
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
} from "./actions";
import { getApprovedListings } from "@/app/shop/actions";
import { useWishlist } from "@/lib/wishlist-context";

type Tab = "listings" | "purchases" | "messages" | "wishlist" | "profile";

/* ── Loading Skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-slate-100 p-6 animate-pulse">
          <div className="flex gap-5">
            <div className="w-20 h-24 bg-slate-100" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-100 w-1/3" />
              <div className="h-3 bg-slate-100 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
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
      if (res.success) setListings((prev) => prev.filter((l) => l.id !== id));
    });
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-[1600px] mx-auto pt-8">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-light mb-2">My Listings</h2>
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Manage your bridal collection</p>
        </div>
        <Link href="/sell/submit" className="bg-primary text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all flex items-center gap-2 shadow-xl shadow-black/5">
          <span className="material-symbols-outlined text-sm">add</span>
          Create New Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {listings.map((listing: any) => (
          <div key={listing.id} className="listing-card group flex flex-col bg-white border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img alt={listing.title} className="listing-image w-full h-full object-cover transition-transform duration-700" src={listing.images?.[0] || 'https://cdn.shopify.com/s/files/1/0839/7222/7357/files/Lorena_-_Studio_-_Ai.jpg'} />
              <div className="absolute top-4 left-4">
                <span className={`border px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm ${listing.status === 'approved' ? 'bg-green-500 text-white' : 'status-badge-live'}`}>
                  {listing.status || 'Live'}
                </span>
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <Link href={`/sell/submit?edit=${listing.id}`} className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </Link>
                <Link href={`/shop/${listing.id}`} className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">visibility</span>
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
                      className="text-red-400 text-[9px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
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
    <div className="max-w-[1400px] mx-auto pt-8">
      <header className="mb-12">
        <h2 className="text-4xl font-light mb-2">My Orders</h2>
        <p className="text-slate-400 text-sm">Manage your purchases and track your sales activity.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <section>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <h3 className="text-xl font-medium tracking-tight">Purchases</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{purchases.length}</span>
          </div>
          <div className="space-y-6">
            {purchases.map((order: any) => (
              <div key={order.id} className="bg-white border border-slate-200 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Order #{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-24 bg-slate-100 flex-shrink-0">
                    {order.listings?.images?.[0] ? (
                      <img src={order.listings.images[0]} alt="" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">👗</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{order.listings?.title || "Signature Couture"}</h4>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full">{order.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-sm font-medium">${order.total?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-xs text-slate-600">{new Date(order.created_at).toLocaleDateString()}</p>
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
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <h3 className="text-xl font-medium tracking-tight">Sales</h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{sales.length}</span>
          </div>
          <div className="space-y-6">
            {sales.map((order: any) => (
              <div key={order.id} className="bg-white border border-slate-200 p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Order #{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-24 bg-slate-100 flex-shrink-0">
                    {order.listings?.images?.[0] ? (
                      <img src={order.listings.images[0]} alt="" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">👗</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{order.listings?.title || "Signature Couture"}</h4>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full">{order.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Net Payout</p>
                        <p className="text-sm font-medium">${order.seller_payout?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-xs text-slate-600">{new Date(order.created_at).toLocaleDateString()}</p>
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
   MESSAGES TAB
   ══════════════════════════════════════════════════ */
function MessagesTab() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getMyConversations().then((d) => {
      setConversations(d);
      if (d.length > 0) openConversation(d[0].id);
      setLoading(false);
    });
  }, []);

  const openConversation = (convId: string) => {
    setActiveConv(convId);
    getConversationMessages(convId).then(setMessages);
  };

  const handleSend = () => {
    if (!activeConv || !newMsg.trim()) return;
    startTransition(async () => {
      const res = await sendMessage(activeConv, newMsg);
      if (res.success) {
        setNewMsg("");
        const updated = await getConversationMessages(activeConv);
        setMessages(updated);
      }
    });
  };

  if (loading) return <LoadingSkeleton />;

  const activeConvObj = conversations.find(c => c.id === activeConv);

  return (
    <div className="max-w-[1600px] mx-auto h-[min(calc(100vh-200px),800px)] min-h-[600px] flex border border-slate-100 mt-8 mb-16">
      <aside className="w-full md:w-[350px] lg:w-[400px] border-r border-slate-100 flex flex-col bg-white">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-light mb-4">Inbox</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-xs focus:ring-1 focus:ring-accent/50 transition-all" placeholder="Search conversations..." type="text" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.map((conv: any) => {
            const isActive = activeConv === conv.id;
            const lastMsg = conv.messages?.[conv.messages.length - 1];
            return (
              <div
                key={conv.id}
                onClick={() => openConversation(conv.id)}
                className={`p-6 cursor-pointer transition-colors border-b border-slate-50 flex gap-4 ${isActive ? 'bg-slate-50 border-l-4 border-l-accent' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
              >
                <div className="relative flex-shrink-0">
                  {conv.listings?.images?.[0] ? (
                    <img alt="" className="w-14 h-14 rounded-lg object-cover" src={conv.listings.images[0]} />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-xl">👗</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm tracking-tight truncate ${isActive ? 'font-semibold' : 'font-medium text-slate-600'}`}>
                      {conv.listings?.title || "Inquiry"}
                    </h4>
                  </div>
                  <p className={`text-[11px] font-medium mb-1 truncate uppercase tracking-widest ${isActive ? 'text-accent' : 'text-slate-400'}`}>
                    ${conv.listings?.price?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{lastMsg?.content || "No messages yet."}</p>
                </div>
              </div>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">No conversations yet.</div>
          )}
        </div>
      </aside>
      <section className="flex-1 flex flex-col bg-background-light">
        {activeConvObj ? (
          <>
            <header className="h-20 px-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-sm font-semibold">{activeConvObj.listings?.title || "Listing"}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-accent font-medium">Inquiry details</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/shop/${activeConvObj.listing_id}`} className="px-4 py-2 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">View Listing</Link>
                <button className="material-symbols-outlined text-slate-400 hover:text-slate-900 transition-colors">more_vert</button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-80">
              {messages.map((msg: any) => {
                const isBuyer = msg.sender_id === activeConvObj.buyer_id;
                // Since this uses the same styles for "received" and "sent", we approximate based on user context
                // But without current user id, let's treat buyer messages as left (received), seller messages as right (sent)
                // Assuming the logged-in user is usually the one receiving inquiries in this view.
                return (
                  <div key={msg.id} className={`flex flex-col gap-2 ${isBuyer ? 'items-start' : 'items-end'}`}>
                    <div className={isBuyer ? 'chat-bubble-received' : 'chat-bubble-sent'}>
                      {msg.content}
                    </div>
                    <span className={`text-[9px] text-slate-400 ${isBuyer ? 'ml-1' : 'mr-1'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
            <footer className="p-6 border-t border-slate-100 bg-white">
              <div className="max-w-4xl mx-auto flex items-end gap-4 bg-slate-50 p-3 rounded-[2rem] border border-slate-200">
                <button className="material-symbols-outlined p-2 text-slate-400 hover:text-accent transition-colors">image</button>
                <textarea
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-0 resize-none custom-scrollbar max-h-32 focus:outline-none" placeholder="Type your message..." rows={1}
                />
                <button onClick={handleSend} disabled={isPending || !newMsg.trim()} className="bg-primary text-white h-10 w-10 shrink-0 rounded-full flex items-center justify-center hover:bg-accent transition-all disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Select a conversation to view messages
          </div>
        )}
      </section>
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
    <div className="max-w-5xl mx-auto py-16">
      <div className="flex flex-col md:flex-row gap-16">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden border border-slate-100 p-1 mb-6">
                <img alt="User Avatar" className="w-full h-full object-cover rounded-full" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop" />
              </div>
            </div>
            <h2 className="text-3xl font-light mb-1 italic">{profile?.display_name || "Bridal User"}</h2>
            <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400 mb-8">Member since 2024</p>
            <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-900">Seller Status</span>
                <span className="material-symbols-outlined text-accent text-lg">verified</span>
              </div>
              <div className="h-1 w-full bg-slate-200 rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-accent w-3/4 rounded-full"></div>
              </div>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">75% of verification completed. Link your social profile to reach Pro status.</p>
              <button className="text-[10px] font-bold tracking-widest uppercase text-accent border-b border-accent/30 hover:border-accent transition-all pb-0.5">Complete Profile</button>
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex justify-between items-end mb-12 pb-4 border-b border-slate-100">
              <h3 className="text-3xl font-light">Personal Details</h3>
              <button type="submit" disabled={saving} className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent hover:text-primary transition-colors disabled:opacity-50">
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
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

            <div className="pt-12 flex justify-end gap-6">
              <button type="submit" disabled={saving} className="px-10 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-lg shadow-primary/5 disabled:opacity-50">
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
    <div className="max-w-[1600px] mx-auto pt-8">
      <div className="mb-12">
        <h2 className="text-4xl font-light mb-2">My Wishlist</h2>
        <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">
          {listings.length} {listings.length === 1 ? "gown" : "gowns"} saved
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">favorite_border</span>
          <p className="text-slate-400 mb-2">Your wishlist is empty</p>
          <p className="text-xs text-slate-300 mb-8">Tap the heart on any gown to save it here.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all">
            Browse Gowns
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {listings.map((listing: any) => {
            const image = listing.images?.[0] || listing.products?.images?.[0] || "/placeholder-gown.jpg";
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
                <div className="p-4 md:p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <Link href={`/shop/${listing.id}`}>
                      <h3 className="text-lg font-normal tracking-tight font-serif hover:text-accent transition-colors">{listing.title}</h3>
                    </Link>
                    {listing.size_us && (
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter ml-2">SIZE {listing.size_us}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">
                    {conditionMap[listing.condition] || "Excellent"}
                  </p>
                  <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
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
    <main className="min-h-screen bg-background-light text-slate-900 font-sans">
      <Navbar />

      <div className="pt-28 pb-10">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex justify-center border-b border-slate-100">
            <nav className="flex gap-12">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`pb-4 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors relative ${tab === t.key ? "text-primary" : "text-slate-400 hover:text-accent"}`}
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

          <div className="mt-8">
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
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
