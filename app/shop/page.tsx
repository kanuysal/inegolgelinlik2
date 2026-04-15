"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { fetchProducts, getImageUrl, MinaLidyaProduct } from "@/lib/minalidya-api";
import { thumb, PLACEHOLDER_IMG } from "@/lib/image";
import { useHanger } from "@/lib/hanger-context";

// Helper function to remove accents for search
function removeAccents(str: any): string {
  if (typeof str !== 'string') return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/* ── Custom Filter Dropdown ── */
function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLabel = value === "all" ? label : options.find((o) => o.value === value)?.label || label;
  const isActive = value !== "all";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 py-1 transition-colors duration-200 ${
          isActive
            ? "text-[#B76E79]"
            : "text-[#1c1c1c] hover:text-[#B76E79]"
        }`}
      >
        <span className="text-[13px] font-medium uppercase tracking-[0.12em]">{activeLabel}</span>
        <svg
          className={`w-2.5 h-2.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isActive && <span className="w-1 h-1 rounded-full bg-[#B76E79]" />}
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-[200px] bg-white/95 backdrop-blur-xl border border-[#1c1c1c]/8 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 py-2">
          <div className="px-5 pt-2 pb-2.5 border-b border-[#1c1c1c]/5 mb-1">
            <span className="text-[10px] font-light uppercase tracking-[0.2em] text-[#1c1c1c]/30">{label}</span>
          </div>
          <button
            onClick={() => { onChange("all"); setOpen(false); }}
            className={`w-full text-left px-5 py-3 text-sm tracking-wide transition-all duration-200 font-serif ${
              value === "all"
                ? "text-[#1c1c1c] bg-[#1c1c1c]/[0.03]"
                : "text-[#1c1c1c]/40 hover:text-[#1c1c1c] hover:bg-[#1c1c1c]/[0.02] hover:pl-6"
            }`}
          >
            TÜMÜ
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-5 py-3 text-sm tracking-wide transition-all duration-200 font-serif ${
                value === opt.value
                  ? "text-[#1c1c1c] bg-[#1c1c1c]/[0.03]"
                  : "text-[#1c1c1c]/40 hover:text-[#1c1c1c] hover:bg-[#1c1c1c]/[0.02] hover:pl-6"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Wrap the main content in a component that uses searchParams
function ShopContent() {
  const { isOnHanger, toggleHanger } = useHanger();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "gelinlik";

  const [listings, setListings] = useState<MinaLidyaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [modestFilter, setModestFilter] = useState("all");

  useEffect(() => {
    // Also update category if searchParams change
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts().then((data) => {
      if (data && data.length > 0) {
        setListings(data);
      }
      setLoading(false);
    });
  }, []);

  const CATEGORIES = [
    { value: "gelinlik", label: "GELİNLİK" },
    { value: "abiye", label: "ABİYE" },
    { value: "after-party", label: "AFTER PARTY" },
    { value: "nikah", label: "NİKAH" },
    { value: "soz-elbisesi", label: "SÖZ ELBİSESİ" },
    { value: "nisanlik", label: "NİŞANLIK" },
    { value: "kina-elbisesi", label: "KINA ELBİSESİ" },
    { value: "kaftan", label: "KAFTAN" },
    { value: "tesettur-gelinlik", label: "TESETTÜR GELİNLİK" },
    { value: "salvar", label: "ŞALVAR" },
    { value: "buyuk-beden", label: "BÜYÜK BEDEN" },
    { value: "outlet", label: "OUTLET" },
  ];

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const title = l.productName || l.name || "";
      if (search) {
        const q = removeAccents(search);
        const productCats = Array.isArray(l.category) ? l.category : (l.category ? [l.category] : []);
        const catsToSearch = [...productCats, ...(l.categories || [])];
        
        const match =
          removeAccents(title).includes(q) ||
          catsToSearch.some(c => removeAccents(c).includes(q));
        if (!match) return false;
      }
      
      if (category !== "all") {
        const productCats = Array.isArray(l.category) ? l.category : (l.category ? [l.category] : []);
        const allCats = [...productCats, ...(l.categories || [])].map(c => c.toLowerCase());
        if (!allCats.includes(category)) return false;
      }
      
      if (modestFilter !== "all") {
        const isModest = l.isModest === true || 
                        l.mappedAttributes?.["Tesettür Uyumu"] === "Evet" ||
                        l.mappedAttributes?.["isModest"] === "true" ||
                        (Array.isArray(l.category) && l.category.includes('tesettur-gelinlik'));
        
        if (modestFilter === "yes" && !isModest) return false;
        if (modestFilter === "no" && isModest) return false;
      }
      
      return true;
    });
  }, [listings, search, category, modestFilter]);

  if (loading) return <LoadingSpinner />;

  return (
    <main className="min-h-screen flex flex-col bg-background-light text-slate-900 font-sans">
      <Navbar />

      {/* ── Header ── */}
      <div className="px-4 md:px-8 pt-32 max-w-[1600px] mx-auto mb-12 text-center">
        <h2 className="text-4xl md:text-6xl font-normal tracking-tight font-serif text-[#1c1c1c] lowercase first-letter:uppercase">Koleksiyonlarımızı Keşfedin</h2>
      </div>

      {/* ── Filters bar ── */}
      <div className="md:sticky md:top-[76px] z-30 flex justify-center px-4 mb-12">
        <div className="max-w-6xl w-full px-8 flex flex-wrap items-center justify-between gap-6 py-4 bg-white md:shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-neutral">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-[#1c1c1c]/40 text-lg">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-4 py-1.5 text-xs bg-transparent border-b border-slate-200 focus:border-[#B76E79] focus:ring-0 placeholder:text-[#1c1c1c]/40 text-[#1c1c1c] uppercase tracking-widest font-medium outline-none transition-colors w-44"
              placeholder="ARA..."
              type="text"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-8">
            <FilterDropdown
              label="KATEGORİ"
              value={category}
              onChange={setCategory}
              options={CATEGORIES}
            />

            <FilterDropdown
              label="TESETTÜR UYUMU"
              value={modestFilter}
              onChange={setModestFilter}
              options={[
                { value: "yes", label: "EVET" },
                { value: "no", label: "HAYIR" },
              ]}
            />

            {/* Reset */}
            {(search || category !== "all" || modestFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setCategory("all"); setModestFilter("all"); }}
                className="text-[10px] uppercase tracking-widest text-[#B76E79] hover:text-[#1c1c1c] transition-colors font-bold"
              >
                TEMİZLE
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 pt-6 pb-20 w-full flex-1 max-w-[1600px] mx-auto">
        {/* Total count */}
        <div className="mb-8 pl-2">
            <p className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#1c1c1c]/40">
                {filtered.length} ÜRÜN BULUNDU
            </p>
        </div>

        {/* ── Product grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
          {filtered.map((listing) => {
            const image = listing.images?.[0] ? getImageUrl(listing.images[0]) : PLACEHOLDER_IMG;
            const isModest = listing.isModest === true || 
                             listing.mappedAttributes?.["Tesettür Uyumu"] === "Evet" ||
                             listing.mappedAttributes?.["isModest"] === "true";

            return (
                <div key={listing.id} className="group relative flex flex-col bg-white overflow-hidden transition-all duration-500 h-full">
                    <Link href={`/shop/${listing.slug || listing.id}`} className="block">
                        <div className="aspect-[3/4] overflow-hidden relative bg-slate-100">
                        <img
                            alt={listing.productName || listing.name || "Mina Lidya Model"}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            src={thumb(image, 800)}
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                        />
                        {isModest && (
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 shadow-sm">
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#B76E79]">TESETTÜR</span>
                            </div>
                        )}
                        </div>
                    </Link>
                    
                    {/* Quick Hanger Toggle */}
                    <button 
                        onClick={(e) => { e.preventDefault(); toggleHanger(listing.id.toString()); }}
                        className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center transition-all duration-300 z-10 ${
                            isOnHanger(listing.id.toString()) 
                            ? "bg-[#B76E79] text-white shadow-lg scale-110" 
                            : "bg-white/80 backdrop-blur-md text-[#1c1c1c]/40 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                        }`}
                        title={isOnHanger(listing.id.toString()) ? "Askıdan Çıkar" : "Askıya Ekle"}
                    >
                        <span className="material-symbols-outlined text-[20px]" style={isOnHanger(listing.id.toString()) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            checkroom
                        </span>
                    </button>

                    <Link href={`/shop/${listing.slug || listing.id}`} className="block pt-6 pb-2 text-center">
                        <p className="text-[10px] text-[#B76E79] uppercase tracking-[0.25em] mb-2 font-bold">
                            {Array.isArray(listing.category) ? listing.category[0] : (listing.category || listing.categories?.[0] || "Bridal Couture")}
                        </p>
                        <h3 className="text-xl font-normal tracking-tight font-serif text-[#1c1c1c] mb-3">
                            {listing.productName || listing.name || "Yeni Model"}
                        </h3>
                    </Link>
                </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
            <div className="py-20 text-center">
                <p className="text-gray-400 font-light">Kriterlere uygun ürün bulunamadı.</p>
            </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ShopContent />
    </Suspense>
  );
}
