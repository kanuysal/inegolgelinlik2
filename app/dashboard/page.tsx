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

type Tab = "listings" | "purchases" | "messages" | "profile";

const STATUS_STYLES: Record<string, string> = {
  draft: "border-white/10 text-white/30",
  pending_review: "border-amber-500/30 text-amber-300",
  approved: "border-emerald-500/30 text-emerald-300",
  rejected: "border-red-500/30 text-red-300",
  sold: "border-blue-500/30 text-blue-300",
  archived: "border-white/10 text-white/20",
  pending: "border-amber-500/30 text-amber-300",
  confirmed: "border-blue-500/30 text-blue-300",
  shipped: "border-purple-500/30 text-purple-300",
  delivered: "border-emerald-500/30 text-emerald-300",
  completed: "border-emerald-500/30 text-emerald-300",
  cancelled: "border-red-500/30 text-red-300",
  refunded: "border-orange-500/30 text-orange-300",
};

function StatusBadge({ status }: { status: string }) {
  const styles = STATUS_STYLES[status] || "border-white/10 text-white/30";
  return (
    <span
      className={`${styles} border-none font-sans text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-sm`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

/* ── Loading Skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border border-white/5 p-6 animate-pulse"
        >
          <div className="flex gap-5">
            <div className="w-20 h-24 bg-white/5" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-white/5 w-1/3" />
              <div className="h-3 bg-white/5 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({
  icon,
  title,
  subtitle,
  cta,
  href,
}: {
  icon: string;
  title: string;
  subtitle: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="text-center py-24">
      <div className="text-4xl mb-6 opacity-30">{icon}</div>
      <h3 className="font-serif text-2xl text-white/60 mb-2 tracking-wide">
        {title}
      </h3>
      <p className="font-sans text-xs text-white/25 mb-8 max-w-xs mx-auto">
        {subtitle}
      </p>
      {cta && href && (
        <Link
          href={href}
          className="inline-block px-8 py-3 bg-white text-obsidian font-sans text-xs uppercase tracking-[0.2em] hover:bg-champagne transition-colors"
        >
          {cta}
        </Link>
      )}
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

  if (listings.length === 0) {
    return (
      <EmptyState
        icon="👗"
        title="No listings yet"
        subtitle="Start selling your Galia Lahav gown today"
        cta="Create Listing"
        href="/sell/submit"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-10">
        <p className="font-sans text-[11px] font-bold text-white/20 uppercase tracking-[0.3em]">
          {listings.length} item{listings.length !== 1 ? "s" : ""} listed
        </p>
        <Link
          href="/sell/submit"
          className="px-8 py-3.5 bg-white text-obsidian font-sans text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-resonance-amber transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
        >
          + New Listing
        </Link>
      </div>

      <div className="grid gap-6">
        {listings.map((listing: any) => (
          <div
            key={listing.id}
            className="resonance-panel p-6 flex gap-8 items-center group transition-all duration-500 hover:bg-white/[0.03]"
          >
            <div className="w-24 h-32 bg-white/[0.03] rounded-xl flex-shrink-0 overflow-hidden border border-white/5 group-hover:border-white/10 transition-colors shadow-inner">
              {listing.images?.[0] ? (
                <img
                  src={listing.images[0]}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10 text-3xl">👗</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-serif text-2xl text-white/90 tracking-tight mb-2 group-hover:text-white transition-colors">
                    {listing.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <span className="font-sans text-[11px] font-medium text-white/30 uppercase tracking-widest">{listing.category}</span>
                    <span className="font-sans text-[11px] font-medium text-white/30 uppercase tracking-widest">Size {listing.size_us || "—"}</span>
                    <span className="font-sans text-[11px] font-bold text-resonance-amber uppercase tracking-widest">${listing.price?.toLocaleString()}</span>
                  </div>
                </div>
                <StatusBadge status={listing.status} />
              </div>

              {listing.rejection_reason && (
                <div className="mb-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <p className="text-red-400/80 text-[11px] font-sans leading-relaxed">
                    <span className="font-bold uppercase mr-2 tracking-tighter">Issue:</span> {listing.rejection_reason}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-6">
                <p className="text-white/10 text-[9px] font-sans font-bold uppercase tracking-[0.2em]">
                  Added {new Date(listing.created_at).toLocaleDateString()}
                </p>
                {(listing.status === "draft" || listing.status === "rejected") && (
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={isPending}
                    className="text-red-400/40 text-[9px] font-bold font-sans uppercase tracking-[0.25em] hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
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
  const [view, setView] = useState<"purchases" | "sales">("purchases");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyPurchases(), getMySales()]).then(([p, s]) => {
      setPurchases(p);
      setSales(s);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  const orders = view === "purchases" ? purchases : sales;

  return (
    <div>
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-white/[0.03] p-1 rounded-full border border-white/5 backdrop-blur-md">
          {(["purchases", "sales"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-8 py-3 font-sans text-[10px] font-bold uppercase tracking-[0.3em] transition-all rounded-full ${view === v
                  ? "bg-white text-obsidian shadow-lg"
                  : "text-white/30 hover:text-white/60"
                }`}
            >
              {v === "purchases" ? `Purchases (${purchases.length})` : `Sales (${sales.length})`}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={view === "purchases" ? "🛍️" : "💰"}
          title={`No ${view} yet`}
          subtitle={
            view === "purchases"
              ? "Browse the shop to find your dream gown"
              : "Create a listing to start selling"
          }
          cta={view === "purchases" ? "Browse Shop" : "/sell/submit"}
          href={view === "purchases" ? "/shop" : "/sell/submit"}
        />
      ) : (
        <div className="grid gap-6">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="resonance-panel p-8 hover:bg-white/[0.03] transition-all duration-500 group"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="font-serif text-2xl text-white/90 tracking-tight group-hover:text-white transition-colors">
                    {order.listings?.title || "Signature Couture"}
                  </h3>
                  <p className="font-sans text-[10px] font-bold text-white/15 mt-2 uppercase tracking-[0.3em]">
                    Reference #{order.id.slice(0, 8)} ·{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-white/10 text-[9px] font-bold font-sans uppercase tracking-[0.4em]">Transaction Total</p>
                  <p className="text-white/80 font-serif text-2xl">${order.total?.toLocaleString()}</p>
                </div>

                {view === "sales" && (
                  <>
                    <div className="space-y-1">
                      <p className="text-white/10 text-[9px] font-bold font-sans uppercase tracking-[0.4em]">House Commission</p>
                      <p className="text-white/30 font-sans text-sm">${order.commission_amount?.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white/10 text-[9px] font-bold font-sans uppercase tracking-[0.4em]">Final Payout</p>
                      <p className="text-resonance-amber font-serif text-2xl">${order.seller_payout?.toLocaleString()}</p>
                    </div>
                  </>
                )}

                {order.tracking_number && (
                  <div className="space-y-1">
                    <p className="text-white/10 text-[9px] font-bold font-sans uppercase tracking-[0.4em]">Consignment Tracking</p>
                    <p className="text-resonance-amber font-sans text-sm tracking-widest">{order.tracking_number}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon="💬"
        title="No messages yet"
        subtitle="Conversations will appear here when buyers contact you"
      />
    );
  }

  return (
    <div className="resonance-panel grid grid-cols-1 md:grid-cols-3 overflow-hidden min-h-[600px] border-white/10">
      {/* Conversation list */}
      <div className="md:col-span-1 border-r border-white/5 bg-white/[0.01]">
        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
          <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">
            Inbox
          </h3>
        </div>
        <div className="divide-y divide-white/[0.03] overflow-y-auto max-h-[520px]">
          {conversations.map((conv: any) => {
            const lastMsg = conv.messages?.[conv.messages.length - 1];
            const unread = conv.messages?.filter((m: any) => !m.is_read).length || 0;
            const isActive = activeConv === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => openConversation(conv.id)}
                className={`w-full text-left px-8 py-6 transition-all duration-300 ${isActive ? "bg-white/[0.05] border-l-2 border-resonance-amber" : "hover:bg-white/[0.02]"
                  }`}
              >
                <p className={`font-serif text-lg tracking-tight transition-colors ${isActive ? "text-white" : "text-white/60"}`}>
                  {conv.listings?.title || "Couture Inquiry"}
                </p>
                <p className="font-sans text-[11px] text-white/20 truncate mt-2 tracking-wide font-medium">
                  {lastMsg?.content || "Archive thread"}
                </p>
                {unread > 0 && (
                  <span className="inline-block mt-3 bg-resonance-amber text-obsidian text-[8px] px-2 py-0.5 font-bold font-sans uppercase tracking-widest rounded-full">
                    {unread} New
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Message thread */}
      <div className="md:col-span-2 flex flex-col bg-obsidian/20 backdrop-blur-sm">
        {activeConv ? (
          <>
            <div className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-white/5">
              {messages.map((msg: any) => {
                const isBuyer = msg.sender_id === conversations.find((c: any) => c.id === activeConv)?.buyer_id;
                return (
                  <div key={msg.id} className={`flex ${isBuyer ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] rounded-3xl px-6 py-4 transition-all duration-500 hover:shadow-lg ${isBuyer
                        ? "resonance-panel rounded-bl-none border-white/10 text-white/70"
                        : "bg-white/[0.04] rounded-br-none border border-resonance-amber/20 text-resonance-amber/90"
                      }`}
                    >
                      <p className="font-sans text-[13px] leading-relaxed tracking-wide">{msg.content}</p>
                      <p className="font-sans text-[9px] font-bold text-white/10 mt-3 uppercase tracking-widest">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
              <div className="flex gap-4 p-1 bg-white/[0.02] border border-white/10 rounded-full focus-within:border-resonance-amber/40 transition-all shadow-inner">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Draft your reply..."
                  className="flex-1 bg-transparent px-8 py-3.5 font-sans text-[13px] text-white/80 placeholder:text-white/10 focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={isPending || !newMsg.trim()}
                  className="px-8 py-3.5 bg-white text-obsidian font-sans text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-resonance-amber transition-all duration-500 disabled:opacity-30 disabled:grayscale-[0.5]"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <div className="text-6xl mb-6">✧</div>
            <p className="font-sans text-[10px] font-bold text-white uppercase tracking-[0.4em]">
              Select a conversation
            </p>
          </div>
        )}
      </div>
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
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="resonance-panel p-10 md:p-12 space-y-8 border-white/10">
        {[
          {
            label: "Email Protocol",
            name: "email",
            type: "email",
            value: profile?.email || "",
            disabled: true,
          },
          {
            label: "Public Display Name",
            name: "display_name",
            defaultValue: profile?.display_name || "",
            placeholder: "House Alias",
          },
          {
            label: "Member Full Name",
            name: "full_name",
            defaultValue: profile?.full_name || "",
            placeholder: "Legal Identity",
          },
          {
            label: "Private Phone",
            name: "phone",
            defaultValue: profile?.phone || "",
            placeholder: "Encrypted Contact",
          },
        ].map((field) => (
          <div key={field.name} className="space-y-3">
            <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 ml-4">
              {field.label}
            </label>
            <input
              type={field.type || "text"}
              name={field.name}
              defaultValue={field.defaultValue}
              value={field.disabled ? field.value : undefined}
              disabled={field.disabled}
              placeholder={field.placeholder}
              className={`w-full border border-white/10 bg-white/[0.02] rounded-full px-8 py-4 font-sans text-[13px] text-white placeholder:text-white/10 focus:outline-none focus:border-resonance-amber/40 transition-all ${field.disabled ? "opacity-30 cursor-not-allowed border-dashed" : "hover:border-white/20"
                }`}
            />
          </div>
        ))}

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-5 bg-white text-obsidian font-sans text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-resonance-amber transition-all duration-500 disabled:opacity-50 shadow-[0_0_40px_rgba(255,255,255,0.05)]"
          >
            {saving ? "Updating Account..." : saved ? "✓ Protocol Updated" : "Update Profile"}
          </button>
        </div>
      </form>
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
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    getMyNotifications().then(setNotifications);
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "listings", label: "My Listings" },
    { key: "purchases", label: "Orders" },
    { key: "messages", label: "Messages" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <main className="min-h-screen bg-obsidian">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-48 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center"
        >
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.5em] text-resonance-amber mb-6">
            Private Account
          </p>
          <h1 className="font-serif text-6xl md:text-8xl font-light tracking-tighter text-white/95 leading-none">
            Dashboard
          </h1>
        </motion.div>

        {/* Tab navigation */}
        <div className="flex justify-center gap-10 mb-20 border-b border-white/5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 pb-8 font-sans text-[11px] font-bold uppercase tracking-[0.3em] transition-all relative ${tab === t.key ? "text-resonance-amber" : "text-white/20 hover:text-white/40"
                }`}
            >
              {t.label}
              {tab === t.key && (
                <motion.div
                  layoutId="dashboard-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-resonance-amber shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "listings" && <ListingsTab />}
        {tab === "purchases" && <PurchasesTab />}
        {tab === "messages" && <MessagesTab />}
        {tab === "profile" && <ProfileTab />}
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
