"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
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
  return (
    <span
      className={`${
        STATUS_STYLES[status] || "border-white/10 text-white/30"
      } border text-[10px] px-3 py-1 font-sans uppercase tracking-[0.15em]`}
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-8">
        <p className="font-sans text-xs text-white/30 tracking-wider">
          {listings.length} listing{listings.length !== 1 ? "s" : ""}
        </p>
        <Link
          href="/sell/submit"
          className="px-6 py-2.5 bg-white text-obsidian font-sans text-[10px] uppercase tracking-[0.2em] hover:bg-champagne transition-colors"
        >
          + New Listing
        </Link>
      </div>
      {listings.map((listing: any) => (
        <div
          key={listing.id}
          className="border border-white/5 p-5 flex gap-5 items-start hover:border-white/10 transition-colors"
        >
          <div className="w-20 h-24 bg-white/5 flex-shrink-0 overflow-hidden">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10 text-2xl">
                👗
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-white/80 tracking-wide truncate">
                  {listing.title}
                </h3>
                <p className="font-sans text-[11px] text-white/25 mt-1 tracking-wider">
                  {listing.category} · Size {listing.size_us || "—"} · $
                  {listing.price?.toLocaleString()}
                </p>
              </div>
              <StatusBadge status={listing.status} />
            </div>
            {listing.rejection_reason && (
              <p className="text-red-400/80 text-[11px] font-sans mt-3 bg-red-900/10 border border-red-500/10 px-3 py-2">
                Rejection: {listing.rejection_reason}
              </p>
            )}
            <div className="flex gap-4 mt-3">
              {(listing.status === "draft" ||
                listing.status === "rejected") && (
                <button
                  onClick={() => handleDelete(listing.id)}
                  disabled={isPending}
                  className="text-red-400/60 text-[10px] font-sans uppercase tracking-wider hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              )}
              <p className="text-white/15 text-[10px] font-sans tracking-wider">
                Created {new Date(listing.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
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
      <div className="flex gap-0 mb-8 border border-white/10 inline-flex">
        {(["purchases", "sales"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-6 py-2.5 font-sans text-[10px] uppercase tracking-[0.2em] transition-all ${
              view === v
                ? "bg-white text-obsidian"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {v === "purchases" ? `Purchases (${purchases.length})` : `Sales (${sales.length})`}
          </button>
        ))}
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
          cta={view === "purchases" ? "Browse Shop" : "Create Listing"}
          href={view === "purchases" ? "/shop" : "/sell/submit"}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="border border-white/5 p-6 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg text-white/80 tracking-wide">
                    {order.listings?.title || "Listing"}
                  </h3>
                  <p className="font-sans text-[10px] text-white/20 mt-1 tracking-wider">
                    Order #{order.id.slice(0, 8)} ·{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/5">
                <div>
                  <p className="text-white/20 text-[10px] font-sans uppercase tracking-wider">
                    Total
                  </p>
                  <p className="text-white/70 font-serif text-xl mt-1">
                    ${order.total?.toLocaleString()}
                  </p>
                </div>
                {view === "sales" && (
                  <>
                    <div>
                      <p className="text-white/20 text-[10px] font-sans uppercase tracking-wider">
                        Commission
                      </p>
                      <p className="text-white/40 font-sans text-sm mt-1">
                        ${order.commission_amount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/20 text-[10px] font-sans uppercase tracking-wider">
                        Your Payout
                      </p>
                      <p className="text-emerald-400/80 font-serif text-xl mt-1">
                        ${order.seller_payout?.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
                {order.tracking_number && (
                  <div>
                    <p className="text-white/20 text-[10px] font-sans uppercase tracking-wider">
                      Tracking
                    </p>
                    <p className="text-gold-muted font-sans text-sm mt-1">
                      {order.tracking_number}
                    </p>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/5 overflow-hidden min-h-[500px]">
      {/* Conversation list */}
      <div className="md:col-span-1 border-r border-white/5">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-sans text-[10px] uppercase tracking-[0.25em] text-white/30">
            Conversations
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {conversations.map((conv: any) => {
            const lastMsg = conv.messages?.[conv.messages.length - 1];
            const unread =
              conv.messages?.filter((m: any) => !m.is_read).length || 0;
            return (
              <button
                key={conv.id}
                onClick={() => openConversation(conv.id)}
                className={`w-full text-left px-5 py-4 hover:bg-white/[0.02] transition-colors ${
                  activeConv === conv.id ? "bg-white/[0.03]" : ""
                }`}
              >
                <p className="font-serif text-sm text-white/70 truncate">
                  {conv.listings?.title || "Listing"}
                </p>
                <p className="font-sans text-[11px] text-white/20 truncate mt-1">
                  {lastMsg?.content || "No messages"}
                </p>
                {unread > 0 && (
                  <span className="inline-block mt-2 bg-gold-muted text-obsidian text-[9px] px-2 py-0.5 font-sans tracking-wider">
                    {unread} new
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Message thread */}
      <div className="md:col-span-2 flex flex-col">
        {activeConv ? (
          <>
            <div className="flex-1 p-5 space-y-3 overflow-y-auto max-h-[400px]">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id ===
                    conversations.find((c: any) => c.id === activeConv)
                      ?.buyer_id
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 ${
                      msg.sender_id ===
                      conversations.find((c: any) => c.id === activeConv)
                        ?.buyer_id
                        ? "bg-white/5 text-white/70"
                        : "bg-gold-muted/10 text-champagne/80 border border-gold-muted/10"
                    }`}
                  >
                    <p className="font-sans text-sm">{msg.content}</p>
                    <p className="font-sans text-[9px] text-white/20 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5 flex gap-3">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-white/[0.03] border border-white/10 px-5 py-3 font-sans text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-gold-muted/40 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={isPending || !newMsg.trim()}
                className="px-6 py-3 bg-white text-obsidian font-sans text-[10px] uppercase tracking-[0.2em] hover:bg-champagne transition-colors disabled:opacity-30"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-sans text-xs text-white/15 tracking-wider">
              Select a conversation to view messages
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
    <form onSubmit={handleSubmit} className="max-w-lg space-y-8">
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
          placeholder: "How others see you",
        },
        {
          label: "Full Name",
          name: "full_name",
          defaultValue: profile?.full_name || "",
          placeholder: "For shipping & invoicing",
        },
        {
          label: "Phone",
          name: "phone",
          defaultValue: profile?.phone || "",
          placeholder: "+1 (555) 000-0000",
        },
      ].map((field) => (
        <div key={field.name}>
          <label className="block font-sans text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3">
            {field.label}
          </label>
          <input
            type={field.type || "text"}
            name={field.name}
            defaultValue={field.defaultValue}
            value={field.disabled ? field.value : undefined}
            disabled={field.disabled}
            placeholder={field.placeholder}
            className={`w-full border border-white/10 bg-white/[0.03] px-4 py-3 font-sans text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-gold-muted/40 transition-colors ${
              field.disabled ? "text-white/30 cursor-not-allowed" : ""
            }`}
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="px-8 py-3 bg-white text-obsidian font-sans text-xs uppercase tracking-[0.2em] hover:bg-champagne transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
      </button>
    </form>
  );
}

/* ══════════════════════════════════════════════════
   MAIN DASHBOARD PAGE
   ══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("listings");
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

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-28 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-muted/50 mb-3">
            My Account
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-thin text-white/90 tracking-wider uppercase">
            Dashboard
          </h1>
        </motion.div>

        {/* Tab navigation */}
        <div className="flex gap-0 mb-10 border-b border-white/5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-4 font-sans text-xs uppercase tracking-[0.2em] transition-colors relative ${
                tab === t.key ? "text-white/80" : "text-white/25 hover:text-white/50"
              }`}
            >
              {t.label}
              {tab === t.key && (
                <motion.div
                  layoutId="dashboard-tab"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-gold-muted/60 to-champagne/40"
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
