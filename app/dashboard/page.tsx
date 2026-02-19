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
  draft: "bg-[#1c1c1c]/[0.04] text-[#1c1c1c]/40 border border-[#1c1c1c]/10",
  pending_review: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
  sold: "bg-blue-50 text-blue-700 border border-blue-200",
  archived: "bg-[#1c1c1c]/[0.04] text-[#1c1c1c]/30 border border-[#1c1c1c]/10",
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border border-purple-200",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
  refunded: "bg-orange-50 text-orange-600 border border-orange-200",
};

function StatusBadge({ status }: { status: string }) {
  const styles = STATUS_STYLES[status] || "bg-[#1c1c1c]/[0.04] text-[#1c1c1c]/40 border border-[#1c1c1c]/10";
  return (
    <span
      className={`${styles} font-sans text-[9px] font-light uppercase tracking-[0.15em] px-3 py-1.5`}
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
          className="border border-[#1c1c1c]/5 p-6 animate-pulse"
        >
          <div className="flex gap-5">
            <div className="w-20 h-24 bg-[#1c1c1c]/[0.03]" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-[#1c1c1c]/[0.03] w-1/3" />
              <div className="h-3 bg-[#1c1c1c]/[0.03] w-1/2" />
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
      <div className="text-4xl mb-6 opacity-20">{icon}</div>
      <h3 className="font-serif text-2xl text-[#1c1c1c]/60 mb-2 tracking-wide">
        {title}
      </h3>
      <p className="font-sans text-xs text-[#1c1c1c]/30 mb-8 max-w-xs mx-auto font-light">
        {subtitle}
      </p>
      {cta && href && (
        <Link
          href={href}
          className="inline-block px-14 py-5 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all duration-300"
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
        icon="&#x1F457;"
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
        <p className="font-sans text-[11px] font-light text-[#1c1c1c]/30 uppercase tracking-[0.15em]">
          {listings.length} item{listings.length !== 1 ? "s" : ""} listed
        </p>
        <Link
          href="/sell/submit"
          className="px-8 py-3.5 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all duration-300"
        >
          + New Listing
        </Link>
      </div>

      <div className="grid gap-4">
        {listings.map((listing: any) => (
          <div
            key={listing.id}
            className="p-6 flex gap-8 items-center group transition-all duration-300 border border-[#1c1c1c]/5 hover:border-[#1c1c1c]/10"
          >
            <div className="w-24 h-32 bg-[#1c1c1c]/[0.02] flex-shrink-0 overflow-hidden border border-[#1c1c1c]/5">
              {listing.images?.[0] ? (
                <img
                  src={listing.images[0]}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1c1c1c]/10 text-3xl">&#x1F457;</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-serif text-2xl text-[#1c1c1c] tracking-tight mb-2 font-light">
                    {listing.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <span className="font-sans text-[11px] font-light text-[#1c1c1c]/30 uppercase tracking-[0.1em]">{listing.category}</span>
                    <span className="font-sans text-[11px] font-light text-[#1c1c1c]/30 uppercase tracking-[0.1em]">Size {listing.size_us || "\u2014"}</span>
                    <span className="font-sans text-[11px] font-light text-[#1c1c1c] uppercase tracking-[0.1em]">${listing.price?.toLocaleString()}</span>
                  </div>
                </div>
                <StatusBadge status={listing.status} />
              </div>

              {listing.rejection_reason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200">
                  <p className="text-red-600 text-[11px] font-sans leading-relaxed font-light">
                    <span className="font-medium uppercase mr-2">Issue:</span> {listing.rejection_reason}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-6">
                <p className="text-[#1c1c1c]/20 text-[9px] font-sans font-light uppercase tracking-[0.15em]">
                  Added {new Date(listing.created_at).toLocaleDateString()}
                </p>
                {(listing.status === "draft" || listing.status === "rejected") && (
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={isPending}
                    className="text-red-400 text-[9px] font-light font-sans uppercase tracking-[0.15em] hover:text-red-600 transition-colors"
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
      <div className="flex justify-center gap-12 mb-12 border-b border-[#1c1c1c]/5">
        {(["purchases", "sales"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`pb-4 font-sans text-[11px] font-light uppercase tracking-[0.15em] transition-all relative ${view === v
                ? "text-[#1c1c1c]"
                : "text-[#1c1c1c]/20 hover:text-[#1c1c1c]/50"
              }`}
          >
            {v === "purchases" ? `Purchases (${purchases.length})` : `Sales (${sales.length})`}
            {view === v && (
              <motion.div
                layoutId="orders-tab"
                className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#1c1c1c]"
              />
            )}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={view === "purchases" ? "\uD83D\uDECD\uFE0F" : "\uD83D\uDCB0"}
          title={`No ${view} yet`}
          subtitle={
            view === "purchases"
              ? "Browse the shop to find your dream gown"
              : "Create a listing to start selling"
          }
          cta={view === "purchases" ? "Browse Shop" : "Create Listing"}
          href={view === "purchases" ? "/shop" : "/sell/submit"}
        />
      ) : (
        <div className="grid gap-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="p-8 border border-[#1c1c1c]/5 hover:border-[#1c1c1c]/10 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="font-serif text-2xl text-[#1c1c1c] tracking-tight font-light">
                    {order.listings?.title || "Signature Couture"}
                  </h3>
                  <p className="font-sans text-[10px] font-light text-[#1c1c1c]/20 mt-2 uppercase tracking-[0.15em]">
                    Reference #{order.id.slice(0, 8)} ·{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#1c1c1c]/5">
                <div className="space-y-1">
                  <p className="text-[#1c1c1c]/25 text-[9px] font-light font-sans uppercase tracking-[0.15em]">Transaction Total</p>
                  <p className="text-[#1c1c1c] font-serif text-2xl font-light">${order.total?.toLocaleString()}</p>
                </div>

                {view === "sales" && (
                  <>
                    <div className="space-y-1">
                      <p className="text-[#1c1c1c]/25 text-[9px] font-light font-sans uppercase tracking-[0.15em]">House Commission</p>
                      <p className="text-[#1c1c1c]/40 font-sans text-sm font-light">${order.commission_amount?.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#1c1c1c]/25 text-[9px] font-light font-sans uppercase tracking-[0.15em]">Final Payout</p>
                      <p className="text-[#1c1c1c] font-serif text-2xl font-light">${order.seller_payout?.toLocaleString()}</p>
                    </div>
                  </>
                )}

                {order.tracking_number && (
                  <div className="space-y-1">
                    <p className="text-[#1c1c1c]/25 text-[9px] font-light font-sans uppercase tracking-[0.15em]">Consignment Tracking</p>
                    <p className="text-[#1c1c1c] font-sans text-sm tracking-widest font-light">{order.tracking_number}</p>
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
        icon="\uD83D\uDCAC"
        title="No messages yet"
        subtitle="Conversations will appear here when buyers contact you"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 overflow-hidden min-h-[600px] border border-[#1c1c1c]/5">
      {/* Conversation list */}
      <div className="md:col-span-1 border-r border-[#1c1c1c]/5">
        <div className="px-8 py-6 border-b border-[#1c1c1c]/5 bg-[#1c1c1c]/[0.02]">
          <h3 className="font-sans text-[10px] font-light uppercase tracking-[0.15em] text-[#1c1c1c]/30">
            Inbox
          </h3>
        </div>
        <div className="divide-y divide-[#1c1c1c]/5 overflow-y-auto max-h-[520px]">
          {conversations.map((conv: any) => {
            const lastMsg = conv.messages?.[conv.messages.length - 1];
            const unread = conv.messages?.filter((m: any) => !m.is_read).length || 0;
            const isActive = activeConv === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => openConversation(conv.id)}
                className={`w-full text-left px-8 py-6 transition-all duration-300 ${isActive ? "bg-[#1c1c1c]/[0.04] border-l-2 border-[#1c1c1c]" : "hover:bg-[#1c1c1c]/[0.02]"
                  }`}
              >
                <p className={`font-serif text-lg tracking-tight transition-colors font-light ${isActive ? "text-[#1c1c1c]" : "text-[#1c1c1c]/50"}`}>
                  {conv.listings?.title || "Couture Inquiry"}
                </p>
                <p className="font-sans text-[11px] text-[#1c1c1c]/25 truncate mt-2 tracking-wide font-light">
                  {lastMsg?.content || "Archive thread"}
                </p>
                {unread > 0 && (
                  <span className="inline-block mt-3 bg-[#1c1c1c] text-white text-[8px] px-2 py-0.5 font-light font-sans uppercase tracking-[0.15em]">
                    {unread} New
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Message thread */}
      <div className="md:col-span-2 flex flex-col bg-[#1c1c1c]/[0.01]">
        {activeConv ? (
          <>
            <div className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[500px]">
              {messages.map((msg: any) => {
                const isBuyer = msg.sender_id === conversations.find((c: any) => c.id === activeConv)?.buyer_id;
                return (
                  <div key={msg.id} className={`flex ${isBuyer ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] px-6 py-4 transition-all duration-300 ${isBuyer
                        ? "bg-[#1c1c1c]/[0.03] border border-[#1c1c1c]/5 text-[#1c1c1c]/70"
                        : "bg-[#1c1c1c] text-white"
                      }`}
                    >
                      <p className="font-sans text-[13px] leading-relaxed font-light">{msg.content}</p>
                      <p className="font-sans text-[9px] font-light text-[#1c1c1c]/20 mt-3 uppercase tracking-[0.1em]">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-[#1c1c1c]/5">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Draft your reply..."
                  className="flex-1 px-6 py-4 border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] placeholder:text-[#1c1c1c]/20 font-sans text-sm font-light focus:outline-none focus:border-[#1c1c1c]/30 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={isPending || !newMsg.trim()}
                  className="px-8 py-4 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all duration-300 disabled:opacity-30"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="font-sans text-[11px] font-light text-[#1c1c1c]/15 uppercase tracking-[0.15em]">
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
      <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-8 border border-[#1c1c1c]/5">
        {[
          {
            label: "Email",
            name: "email",
            type: "email",
            value: profile?.email || "",
            disabled: true,
          },
          {
            label: "Display Name",
            name: "display_name",
            defaultValue: profile?.display_name || "",
            placeholder: "Your display name",
          },
          {
            label: "Full Name",
            name: "full_name",
            defaultValue: profile?.full_name || "",
            placeholder: "Your full name",
          },
          {
            label: "Phone",
            name: "phone",
            defaultValue: profile?.phone || "",
            placeholder: "Contact number",
          },
        ].map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="block font-sans text-[11px] font-light uppercase tracking-[0.15em] text-[#1c1c1c]/40">
              {field.label}
            </label>
            <input
              type={field.type || "text"}
              name={field.name}
              defaultValue={field.defaultValue}
              value={field.disabled ? field.value : undefined}
              disabled={field.disabled}
              placeholder={field.placeholder}
              className={`w-full border border-[#1c1c1c]/10 bg-white px-5 py-4 font-sans text-sm text-[#1c1c1c] placeholder:text-[#1c1c1c]/20 font-light focus:outline-none focus:border-[#1c1c1c]/30 transition-all ${field.disabled ? "opacity-40 cursor-not-allowed border-dashed" : "hover:border-[#1c1c1c]/20"
                }`}
            />
          </div>
        ))}

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-5 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all duration-300 disabled:opacity-50"
          >
            {saving ? "Updating..." : saved ? "Updated" : "Update Profile"}
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
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-48 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center"
        >
          <p className="font-sans text-[11px] font-light uppercase tracking-[0.4em] text-[#1c1c1c]/30 mb-6">
            Private Account
          </p>
          <h1 className="font-serif text-6xl md:text-8xl font-light tracking-[-0.02em] text-[#1c1c1c] leading-none">
            Dashboard
          </h1>
        </motion.div>

        {/* Tab navigation */}
        <div className="flex justify-center gap-12 mb-20 border-b border-[#1c1c1c]/5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-6 font-sans text-[12px] font-light uppercase tracking-[0.2em] transition-all relative ${tab === t.key ? "text-[#1c1c1c]" : "text-[#1c1c1c]/20 hover:text-[#1c1c1c]/50"
                }`}
            >
              {t.label}
              {tab === t.key && (
                <motion.div
                  layoutId="dashboard-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#1c1c1c]"
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
