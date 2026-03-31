/* ══════════════════════════════════════════════════
   Product Detail Page — RE:GALIA
   /shop/[id]
   ══════════════════════════════════════════════════ */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { mockListings, type Listing, type ListingType } from "@/lib/mock-listings";
import { getListingById, startConversation, getRelatedListings } from "../actions";
import { createCheckoutSession } from "../checkout-actions";
import { GOWN_CATALOG } from "@/lib/catalog";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { createClient } from "@/lib/supabase/client";
import { useWishlist } from "@/lib/wishlist-context";
import { thumb, fullImg, PLACEHOLDER_IMG } from "@/lib/image";

/* ── Helpers ────────────────────────────────────── */

function fmt(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <path
        d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z"
        fill="currentColor"
      />
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Accordion Section ──────────────────────────── */

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-[#1c1c1c]/5 py-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="font-sans text-[12px] uppercase tracking-[0.1em] font-light text-[#1c1c1c] group-hover:text-[#1c1c1c] transition-colors">{title}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#1c1c1c]/40 text-xl leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SellerBadge({ type }: { type: ListingType }) {
  if (type === "brand_direct") {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#1c1c1c]">
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
            <path
              d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.82 8.07L18.56 10.74L20 13.14L17.72 14.72L17.5 17.66L14.58 17.95L12.73 20.39L10.27 18.76L7.27 19.5L6.27 16.73L3.53 15.32L4.63 12.56L3.27 10L5.57 8.45L5.82 5.51L8.74 5.27L10.64 2.87L12 2Z"
              fill="#1c1c1c"
            />
            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#1c1c1c] font-light">
            Sold by Galia Lahav
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 text-[#1c1c1c]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 flex-shrink-0">
            <path d="M9 14l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10h11a4 4 0 0 1 0 8h-1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-sans text-[9px] uppercase tracking-[0.1em] font-light">
            Returns Accepted
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#1c1c1c]">
      <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 flex-shrink-0 text-[#1c1c1c]">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-[#1c1c1c] font-light">
        {type === "sample_sale" ? "Sample Sale" : "Bride to Bride"}
      </span>
    </div>
  );
}

/** Stockist data stored on the product */
interface StockistData {
  neckline?: string[]
  shape?: string[]
  train?: string[]
  colors?: string[]
  materials?: string[]
  sleeves?: string[]
  waist?: string[]
  style?: string[]
  length?: string[]
  back?: string[]
  collection?: string
  collectionLine?: string
  modelNumber?: string
  retailPrice?: { amount: number; currency: string }
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { has: isWished, toggle: toggleWish } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [listing, setListing] = useState<Listing | null>(null);
  const [productDescription, setProductDescription] = useState<string>("");
  const [stockistData, setStockistData] = useState<StockistData | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [offerSending, setOfferSending] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [relatedListings, setRelatedListings] = useState<any[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id as string;
    getListingById(id).then((dbRow) => {
      if (dbRow) {
        setSellerId(dbRow.seller_id);
        const condMap: Record<string, Listing["condition"]> = { new_unworn: "New Never Worn", excellent: "Excellent", good: "Good" };
        const silMap: Record<string, Listing["silhouette"]> = { a_line: "A-Line", mermaid: "Mermaid", ball_gown: "Ball Gown", sheath: "Sheath", fit_and_flare: "Fit & Flare", trumpet: "Mermaid" };
        const mainImg = fullImg(dbRow.images?.[0]);

        const productName = dbRow.products?.style_name || dbRow.title;
        const catalogEntry = GOWN_CATALOG.find(
          (g) => g.name.toLowerCase() === productName.toLowerCase()
        );

        const sd: StockistData | null = dbRow.products?.stockist_data || null;
        setStockistData(sd);

        const desc = dbRow.products?.description || catalogEntry?.description || "";
        setProductDescription(desc);

        const productMsrp = dbRow.products?.msrp || dbRow.msrp;

        const listingImages = (dbRow.images || []).filter((u: string) => u && u.startsWith('http'));
        const productImages = (dbRow.products?.images || []).filter((u: string) => u && u.startsWith('http'));
        // Stock photos (Galia Lahav) first, then bride's photos after
        const uniqueImages = Array.from(new Set([...productImages, ...listingImages]));
        const imgs = uniqueImages.length > 0 ? uniqueImages : [mainImg];
        setAllImages(imgs);

        const neckline = sd?.neckline?.[0] || catalogEntry?.neckline || "—";
        const color = sd?.colors?.join(", ") || "Ivory";
        const materials = sd?.materials?.join(", ") || "";

        const collection = sd?.collection || dbRow.products?.style_name || dbRow.category || "Couture";

        setListing({
          id: dbRow.id,
          title: dbRow.title,
          collection,
          designer: "Galia Lahav",
          originalPrice: productMsrp || dbRow.price * 1.4,
          salePrice: dbRow.price,
          currency: "USD",
          size: dbRow.size_us || "—",
          condition: condMap[dbRow.condition] || "Excellent",
          silhouette: silMap[dbRow.silhouette || dbRow.products?.silhouette || ""] || sd?.shape?.[0] || catalogEntry?.silhouette || "—",
          neckline: neckline as Listing["neckline"],
          fabric: (materials.split(",")[0]?.trim() || "Lace") as Listing["fabric"],
          color,
          imageUrl: mainImg,
          stockImageUrl: fullImg(dbRow.products?.images?.[0]) || mainImg,
          verified: true,
          featured: false,
          saves: 0,
          daysListed: 0,
          sellerLocation: "Worldwide",
          listingType: dbRow.listing_type || "peer_to_peer",
          measurements: {
            bust: dbRow.bust_cm ? `${dbRow.bust_cm}cm` : "—",
            waist: dbRow.waist_cm ? `${dbRow.waist_cm}cm` : "—",
            hips: dbRow.hips_cm ? `${dbRow.hips_cm}cm` : "—",
            height: dbRow.height_cm ? `${dbRow.height_cm}cm` : "—",
          },
        });

        // Fetch related listings from the same collection
        getRelatedListings(id, dbRow.category || collection, 4).then((related) => {
          setRelatedListings(related);
        });
      } else {
        const found = mockListings.find((l) => l.id === id);
        if (found) {
          setListing(found);
          setAllImages([found.imageUrl, found.stockImageUrl]);
          const catalogEntry = GOWN_CATALOG.find(
            (g) => g.name.toLowerCase() === found.title.toLowerCase()
          );
          if (catalogEntry?.description) setProductDescription(catalogEntry.description);
        }
      }
    });
  }, [params.id]);

  const handleInquiry = async () => {
    if (!inquiryMsg.trim()) return;
    if (!sellerId) {
      setInquiryError("Unable to contact seller. Please try again later.");
      return;
    }
    setInquirySending(true);
    setInquiryError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInquirySending(false);
        router.push(`/auth/login?redirect=/shop/${params.id}`);
        return;
      }

      const result = await startConversation(params.id as string, sellerId, inquiryMsg.trim());
      setInquirySending(false);

      if (result.error) {
        setInquiryError(result.error);
        return;
      }

      setShowInquiry(false);
      setInquiryMsg("");
      router.push("/dashboard?tab=messages");
    } catch (err) {
      setInquirySending(false);
      setInquiryError("Failed to send message. Please try again.");
      console.error("Inquiry error:", err);
    }
  };

  const handleOffer = async () => {
    const amount = Number(offerAmount);
    if (!amount || amount <= 0) {
      setOfferError("Please enter a valid offer amount.");
      return;
    }
    if (!sellerId) {
      setOfferError("Unable to contact seller. Please try again later.");
      return;
    }
    setOfferSending(true);
    setOfferError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setOfferSending(false);
        router.push(`/auth/login?redirect=/shop/${params.id}`);
        return;
      }

      const offerMessage = `Offer: $${amount.toLocaleString()}\n\nI'd like to offer $${amount.toLocaleString()} for this gown.${offerNote.trim() ? `\n\n${offerNote.trim()}` : ""}`;

      const result = await startConversation(params.id as string, sellerId, offerMessage);
      setOfferSending(false);

      if (result.error) {
        setOfferError(result.error);
        return;
      }

      setShowOffer(false);
      setOfferAmount("");
      setOfferNote("");
      router.push("/dashboard?tab=messages");
    } catch (err) {
      setOfferSending(false);
      setOfferError("Failed to send offer. Please try again.");
      console.error("Offer error:", err);
    }
  };

  /* ── Stripe Checkout ─────────────────────────── */
  const handleCheckout = async () => {
    if (!listing) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const result = await createCheckoutSession(listing.id);
      if (result.error) {
        setCheckoutError(result.error);
        setCheckoutLoading(false);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      setCheckoutError("Something went wrong. Please try again.");
      setCheckoutLoading(false);
    }
  };

  if (!listing) return null;

  const images = allImages.length > 0 ? allImages : [listing.imageUrl, listing.stockImageUrl];

  return (
    <div className="min-h-screen bg-white text-[#1c1c1c] pb-32">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 pt-32 lg:pt-48">
        <div className="flex flex-col lg:flex-row gap-20 lg:items-start">

          {/* ──── LEFT: STICKY MEDIA COLUMN ──── */}
          <div className="w-full lg:w-[55%]">
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="group relative aspect-[3/4] overflow-hidden bg-[#efefef] border border-[#1c1c1c]/10">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full"
                >
                  <Image
                    src={images[activeImage]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                  />
                </motion.div>
                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110"
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                        <line x1="17" y1="12" x2="7" y2="12" stroke="currentColor" strokeWidth="1" />
                        <polyline points="11,8 7,12 11,16" stroke="currentColor" strokeWidth="1" fill="none" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110"
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
                        <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1" />
                        <polyline points="13,8 17,12 13,16" stroke="currentColor" strokeWidth="1" fill="none" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pt-1 pb-4 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-24 aspect-[3/4] overflow-hidden border-2 transition-all duration-300 ${activeImage === i ? "border-[#1c1c1c]" : "border-transparent opacity-40"
                      }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ──── RIGHT: SCROLLING CONTENT COLUMN ──── */}
          <div className="w-full lg:w-[45%] lg:pt-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-4 mb-4">
                <p className="font-sans text-sm font-medium uppercase tracking-[0.15em] text-[#333]">
                  {listing.collection}
                </p>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-none tracking-[-0.02em] mb-6 italic font-light">
                {listing.title}
              </h1>
              <div className="mb-8">
                <SellerBadge type={listing.listingType} />
              </div>

              <div className="flex items-baseline gap-6 mb-12">
                <span className="font-sans text-3xl tracking-tight">
                  {fmt(listing.salePrice)}
                </span>
                {listing.originalPrice > listing.salePrice && (
                  <span className="font-sans text-xl text-[#777] line-through">
                    {fmt(listing.originalPrice)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-8 gap-x-12 mb-16 border-t border-[#1c1c1c]/5 pt-10">
                {[
                  ["Size", listing.size],
                  ["Silhouette", listing.silhouette],
                  ["Neckline", listing.neckline],
                  ["Condition", listing.condition],
                  ...(stockistData?.materials?.length ? [["Materials", stockistData.materials.join(", ")]] : []),
                  ...(stockistData?.train?.length ? [["Train", stockistData.train.join(", ")]] : []),
                  ...(stockistData?.sleeves?.length ? [["Sleeves", stockistData.sleeves.join(", ")]] : []),
                  ...(stockistData?.waist?.length ? [["Waist", stockistData.waist.join(", ")]] : []),
                  ...(stockistData?.length?.length ? [["Length", stockistData.length.join(", ")]] : []),
                  ...(stockistData?.back?.length ? [["Back", stockistData.back.join(", ")]] : []),
                  ...(stockistData?.style?.length ? [["Style", stockistData.style.join(", ")]] : []),
                  ...(stockistData?.collectionLine ? [["Collection", `${stockistData.collectionLine} — ${stockistData.collection}`]] : []),
                  ...(stockistData?.retailPrice ? [["Retail Price", fmt(stockistData.retailPrice.amount)]] : []),
                ].filter(([, value]) => value && value !== "—").map(([label, value]) => {
                  const isEmphasized = ["Size", "Silhouette", "Condition"].includes(label);
                  return (
                    <div key={label}>
                      <span className={`font-sans font-light uppercase tracking-[0.15em] text-[#555] block mb-2 ${isEmphasized ? "text-xs" : "text-[10px]"}`}>{label}</span>
                      <span className={`font-sans text-[#1c1c1c] ${isEmphasized ? "text-lg font-medium" : "text-base font-light"}`}>{value}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mb-16 space-y-3">
                {/* Buy Now — brand_direct only */}
                {listing.listingType === "brand_direct" && (
                  <>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="flex-1 py-5 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkoutLoading ? "Redirecting to Checkout…" : "Buy Now"}
                      </button>
                      <button
                        onClick={() => toggleWish(listing.id)}
                        className={`w-14 flex items-center justify-center border transition-all duration-300 ${isWished(listing.id) ? "border-red-200 bg-red-50" : "border-[#1c1c1c]/10 hover:border-[#1c1c1c]/30"}`}
                        aria-label={isWished(listing.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <span
                          className={`material-symbols-outlined text-xl ${isWished(listing.id) ? "text-red-500" : "text-[#1c1c1c]/45"}`}
                          style={isWished(listing.id) ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                    {checkoutError && (
                      <p className="text-red-600 text-xs font-sans">{checkoutError}</p>
                    )}
                    <button
                      onClick={() => setShowInquiry(true)}
                      className="w-full py-4 border border-[#1c1c1c]/10 text-[#1c1c1c] font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:border-[#1c1c1c]/30 hover:bg-[#1c1c1c]/[0.02] transition-all duration-300"
                    >
                      Inquire First
                    </button>
                  </>
                )}

                {/* Inquire + Offer — peer-to-peer / sample_sale */}
                {listing.listingType !== "brand_direct" && (
                  <>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowInquiry(true)}
                        className="flex-1 py-5 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all duration-300"
                      >
                        Inquire Now
                      </button>
                      <button
                        onClick={() => toggleWish(listing.id)}
                        className={`w-14 flex items-center justify-center border transition-all duration-300 ${isWished(listing.id) ? "border-red-200 bg-red-50" : "border-[#1c1c1c]/10 hover:border-[#1c1c1c]/30"}`}
                        aria-label={isWished(listing.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <span
                          className={`material-symbols-outlined text-xl ${isWished(listing.id) ? "text-red-500" : "text-[#1c1c1c]/45"}`}
                          style={isWished(listing.id) ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                    <button
                      onClick={() => setShowOffer(true)}
                      className="w-full py-4 border border-[#1c1c1c]/10 text-[#1c1c1c] font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:border-[#1c1c1c]/30 hover:bg-[#1c1c1c]/[0.02] transition-all duration-300"
                    >
                      Make an Offer
                    </button>
                  </>
                )}
              </div>

              {/* Inquiry Modal */}
              <AnimatePresence>
                {showInquiry && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center px-6"
                  >
                    <div className="absolute inset-0 bg-[#1c1c1c]/60 backdrop-blur-sm" onClick={() => setShowInquiry(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.97 }}
                      className="relative bg-white w-full max-w-lg p-10 shadow-2xl"
                    >
                      <button
                        onClick={() => setShowInquiry(false)}
                        className="absolute top-6 right-6 text-[#1c1c1c]/40 hover:text-[#1c1c1c] transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>

                      <p className="font-sans text-[11px] font-light uppercase tracking-[0.15em] text-[#1c1c1c] mb-3">
                        Private Inquiry
                      </p>
                      <h3 className="font-serif text-3xl text-[#1c1c1c] mb-2 italic tracking-tight font-light">
                        {listing.title}
                      </h3>
                      <p className="font-sans text-xs text-[#333] mb-8 font-light">
                        Your message will be sent directly to the seller. No contact info is shared.
                      </p>

                      {inquiryError && (
                        <div className="mb-4 p-3 border border-red-500/20 bg-red-500/5 text-red-500 text-sm text-center">
                          {inquiryError}
                        </div>
                      )}

                      <textarea
                        value={inquiryMsg}
                        onChange={(e) => setInquiryMsg(e.target.value)}
                        placeholder="Hi, I'm interested in this gown. Is it still available?"
                        rows={4}
                        className="w-full px-4 py-3 border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] placeholder:text-[#1c1c1c]/20 font-sans text-sm font-light focus:outline-none focus:border-[#1c1c1c]/30 transition-colors resize-none mb-6"
                      />

                      <button
                        onClick={handleInquiry}
                        disabled={!inquiryMsg.trim() || inquirySending}
                        className="w-full py-4 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all disabled:opacity-30"
                      >
                        {inquirySending ? "Sending..." : "Send Message"}
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Offer Modal */}
              <AnimatePresence>
                {showOffer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center px-6"
                  >
                    <div className="absolute inset-0 bg-[#1c1c1c]/60 backdrop-blur-sm" onClick={() => setShowOffer(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.97 }}
                      className="relative bg-white w-full max-w-lg p-10 shadow-2xl"
                    >
                      <button
                        onClick={() => setShowOffer(false)}
                        className="absolute top-6 right-6 text-[#1c1c1c]/40 hover:text-[#1c1c1c] transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>

                      <p className="font-sans text-[11px] font-light uppercase tracking-[0.15em] text-[#1c1c1c] mb-3">
                        Make an Offer
                      </p>
                      <h3 className="font-serif text-3xl text-[#1c1c1c] mb-2 italic tracking-tight font-light">
                        {listing.title}
                      </h3>
                      <p className="font-sans text-xs text-[#1c1c1c] mb-2 font-light">
                        Listed at {fmt(listing.salePrice)}
                      </p>
                      <p className="font-sans text-xs text-[#333] mb-8 font-light">
                        Your offer will be sent as a private message to the seller.
                      </p>

                      {offerError && (
                        <div className="mb-4 p-3 border border-red-500/20 bg-red-500/5 text-red-500 text-sm text-center">
                          {offerError}
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="font-sans text-[10px] font-light uppercase tracking-[0.15em] text-[#1c1c1c] block mb-2">
                          Your Offer (USD)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1c1c1c] font-sans text-lg">$</span>
                          <input
                            type="number"
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                            placeholder="0"
                            className="w-full pl-9 pr-4 py-4 border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] font-sans text-2xl font-light focus:outline-none focus:border-[#1c1c1c]/30 transition-colors"
                          />
                        </div>
                      </div>

                      <textarea
                        value={offerNote}
                        onChange={(e) => setOfferNote(e.target.value)}
                        placeholder="Add a note to the seller (optional)"
                        rows={3}
                        className="w-full px-4 py-3 border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] placeholder:text-[#1c1c1c]/20 font-sans text-sm font-light focus:outline-none focus:border-[#1c1c1c]/30 transition-colors resize-none mb-6"
                      />

                      <button
                        onClick={handleOffer}
                        disabled={!offerAmount || offerSending}
                        className="w-full py-4 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all disabled:opacity-30"
                      >
                        {offerSending ? "Sending..." : `Send Offer${offerAmount ? ` — $${Number(offerAmount).toLocaleString()}` : ""}`}
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <AccordionSection title="Seller Notes" defaultOpen>
                  <div className="space-y-4 font-sans text-sm text-[#1c1c1c] leading-relaxed font-light">
                    {productDescription ? <p>{productDescription}</p> : (
                      <p>This gown has been inspected and authenticated by the Galia Lahav atelier.</p>
                    )}
                  </div>
                </AccordionSection>
                <AccordionSection title="Measurements">
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(listing.measurements).map(([key, val]) => (
                      <div key={key}>
                        <span className="font-sans text-[10px] font-light uppercase tracking-[0.1em] text-[#555] block mb-1 capitalize">{key}</span>
                        <span className="font-sans text-base font-light">{val}</span>
                      </div>
                    ))}
                  </div>
                </AccordionSection>
                <AccordionSection title="Size Guide">
                  <div className="space-y-6 font-sans text-sm text-[#1c1c1c] leading-relaxed font-light">
                    <div>
                      <h4 className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#1c1c1c]/70 font-medium mb-3">Couture & Gala</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-[#1c1c1c]/5">
                              <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wider text-[#1c1c1c]/50 font-medium">Size</th>
                              <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wider text-[#1c1c1c]/50 font-medium">Cup</th>
                              <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wider text-[#1c1c1c]/50 font-medium">Bust</th>
                              <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wider text-[#1c1c1c]/50 font-medium">Waist</th>
                              <th className="text-left py-2 text-[10px] uppercase tracking-wider text-[#1c1c1c]/50 font-medium">Hips</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ["34", "A", "80 / 31\"", "58 / 23\"", "86 / 34\""],
                              ["36", "B", "84 / 33\"", "60 / 24\"", "90 / 35\""],
                              ["38", "C", "88 / 35\"", "62 / 24\"", "94 / 37\""],
                              ["40", "D", "92 / 36\"", "66 / 26\"", "98 / 39\""],
                              ["42", "DD", "96 / 38\"", "70 / 28\"", "102 / 40\""],
                              ["44", "DDD", "100 / 39\"", "74 / 29\"", "106 / 42\""],
                              ["46", "E", "105 / 41\"", "80 / 31\"", "112 / 44\""],
                              ["48", "F", "110 / 43\"", "86 / 34\"", "118 / 46\""],
                              ["50", "G", "115 / 45\"", "92 / 36\"", "124 / 49\""],
                              ["52", "H", "120 / 47\"", "98 / 39\"", "130 / 51\""],
                            ].map(([size, cup, bust, waist, hips]) => (
                              <tr key={size} className="border-b border-[#1c1c1c]/[0.03]">
                                <td className="py-2 pr-3 font-medium text-[#1c1c1c]/70">{size}</td>
                                <td className="py-2 pr-3 text-[#1c1c1c]/60">{cup}</td>
                                <td className="py-2 pr-3 text-[#1c1c1c]/60">{bust}</td>
                                <td className="py-2 pr-3 text-[#1c1c1c]/60">{waist}</td>
                                <td className="py-2 text-[#1c1c1c]/60">{hips}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </AccordionSection>
                <AccordionSection title="Shipping & Returns">
                  <div className="space-y-4 font-sans text-sm text-[#1c1c1c] leading-relaxed font-light">
                    {listing.listingType === "brand_direct" ? (
                      <>
                        <p>Returns for brand-direct items are accepted, subject to a $200 fee for domestic orders and $300 international. Exchanges for brand-direct items are accepted subject to a $100 fee for domestic orders and $200 international. Return and exchange requests must be submitted within 5 days of receiving the item.</p>
                        <p className="mt-2"><Link href="/company/return-policy" className="text-[#1c1c1c] underline underline-offset-4 decoration-[#1c1c1c]/20 hover:decoration-[#1c1c1c]/60 transition-colors text-sm">View full return policy</Link></p>
                      </>
                    ) : (
                      <p>Returns for bride-to-bride listings are entirely at the discretion of the buyer and seller. Regalia does not take responsibility for these transactions, and both parties should proceed as they see fit.</p>
                    )}
                    <p className="text-[#555] text-xs mt-4">All transactions between buyers and sellers are conducted independently. RE:GALIA facilitates the marketplace but does not take responsibility for communications, payments, or disputes between parties.</p>
                  </div>
                </AccordionSection>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Styles ── */}
      {relatedListings.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-20">
          <h2 className="font-serif text-3xl md:text-4xl font-light text-[#1c1c1c] mb-10">You May Also Like</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedListings.map((item: any) => {
              const image = thumb(item.products?.images?.[0] || item.images?.[0]);
              const conditionMap: Record<string, string> = {
                new_unworn: "New Never Worn",
                excellent: "Excellent",
                good: "Good",
              };
              return (
                <Link href={`/shop/${item.id}`} key={item.id} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 mb-3">
                    <img
                      src={image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                    />
                  </div>
                  <h3 className="font-serif text-base font-normal mb-1">{item.title}</h3>
                  <p className="text-xs text-[#555] uppercase tracking-wider mb-2">
                    {conditionMap[item.condition] || "Excellent"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-bold">${item.price?.toLocaleString()}</p>
                    {item.msrp && item.msrp > item.price && (
                      <p className="text-xs text-[#777] line-through">${item.msrp.toLocaleString()}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
