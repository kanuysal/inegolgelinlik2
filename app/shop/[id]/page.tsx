"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { fetchProductBySlug, getImageUrl, MinaLidyaProduct } from "@/lib/minalidya-api";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { useHanger } from "@/lib/hanger-context";
import { thumb, PLACEHOLDER_IMG } from "@/lib/image";

/* ── Helpers ────────────────────────────────────── */

function fmt(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
  }).format(amount);
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
        <span className="font-sans text-[12px] uppercase tracking-[0.1em] font-light text-[#1c1c1c]/70 group-hover:text-[#B76E79] transition-colors">{title}</span>
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isOnHanger, toggleHanger } = useHanger();
  const [activeImage, setActiveImage] = useState(0);
  const [product, setProduct] = useState<MinaLidyaProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [allImages, setAllImages] = useState<string[]>([]);

  useEffect(() => {
    const slug = params.id as string;
    fetchProductBySlug(slug).then((data) => {
      if (data) {
        setProduct(data);
        const imgs = data.images?.map(img => getImageUrl(img)) || [];
        setAllImages(imgs.length > 0 ? imgs : [PLACEHOLDER_IMG]);
      }
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return null;
  if (!product) return (
      <div className="min-h-screen flex items-center justify-center">
          <p className="font-serif text-2xl">Ürün bulunamadı.</p>
      </div>
  );

  const images = allImages;

  return (
    <div className="min-h-screen bg-white text-[#1c1c1c] pb-32">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 pt-32 lg:pt-48">
        <div className="flex flex-col lg:flex-row gap-20">

          {/* ── LEFT: STICKY MEDIA COLUMN ──── */}
          <div className="w-full lg:w-[55%]">
            <div className="lg:sticky lg:top-32 lg:self-start space-y-6">
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
                    alt={product.productName || product.name || "Gelinlik"}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
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
                    className={`relative flex-shrink-0 w-24 aspect-[3/4] overflow-hidden border-2 transition-all duration-300 ${activeImage === i ? "border-[#B76E79]" : "border-transparent opacity-40"
                      }`}
                  >
                    <Image src={thumb(img, 300)} alt="Thumbnail" fill className="object-cover" unoptimized onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: SCROLLING CONTENT COLUMN ──── */}
          <div className="w-full lg:w-[45%] lg:pt-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-4 mb-4">
                <p className="font-sans text-sm font-bold uppercase tracking-[0.25em] text-[#B76E79]">
                  {Array.isArray(product.category) ? product.category[0] : (product.category || product.categories?.[0] || "BRIDAL COUTURE")}
                </p>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-none tracking-[-0.02em] mb-12 italic font-light">
                {product.productName || product.name}
              </h1>

              <div className="grid grid-cols-2 gap-y-8 gap-x-12 mb-16 border-t border-[#1c1c1c]/5 pt-10">
                 {product.mappedAttributes ? Object.entries(product.mappedAttributes).map(([key, val]) => (
                   <div key={key}>
                      <span className="font-sans font-light uppercase tracking-[0.15em] text-[#1c1c1c]/60 block mb-2 text-xs">{key}</span>
                      <span className="font-sans text-[#1c1c1c] text-lg font-medium">{val}</span>
                   </div>
                 )) : (
                   <>
                    <div>
                        <span className="font-sans font-light uppercase tracking-[0.15em] text-[#1c1c1c]/60 block mb-2 text-xs">MODEL</span>
                        <span className="font-sans text-[#1c1c1c] text-lg font-medium">{product.sku || "ML-"+product.id}</span>
                    </div>
                    <div>
                        <span className="font-sans font-light uppercase tracking-[0.15em] text-[#1c1c1c]/60 block mb-2 text-xs">BEDEN</span>
                        <span className="font-sans text-[#1c1c1c] text-lg font-medium">Özel Dikim</span>
                    </div>
                    <div>
                        <span className="font-sans font-light uppercase tracking-[0.15em] text-[#1c1c1c]/60 block mb-2 text-xs">TESETTÜR UYUMU</span>
                        <span className="font-sans text-[#1c1c1c] text-lg font-medium">{product.isModest ? "Evet" : "Hayır"}</span>
                    </div>
                    <div>
                        <span className="font-sans font-light uppercase tracking-[0.15em] text-[#1c1c1c]/60 block mb-2 text-xs">DURUM</span>
                        <span className="font-sans text-[#1c1c1c] text-lg font-medium">Yeni / Koleksiyon</span>
                    </div>
                   </>
                 )}
              </div>
              <div className="mb-16 space-y-4">
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      if (!isOnHanger(product.id.toString())) {
                        toggleHanger(product.id.toString());
                      }
                      window.location.href = "/prova-listesi";
                    }}
                    className="w-full py-5 bg-[#1c1c1c] text-white font-sans text-[12px] font-bold uppercase tracking-[0.2em] text-center hover:bg-[#B76E79] transition-all duration-500 shadow-2xl"
                  >
                    DENEMEK İSTİYORUM
                  </button>
                  <div className="flex gap-4">
                    <Link
                      href="/appointment"
                      className="flex-1 py-5 border border-[#1c1c1c]/10 text-[#1c1c1c] font-sans text-[12px] font-bold uppercase tracking-[0.2em] text-center hover:bg-[#1c1c1c] hover:text-white transition-all duration-500"
                    >
                      RANDEVU ALIN
                    </Link>
                    <button
                      onClick={() => toggleHanger(product.id.toString())}
                      className={`w-16 flex items-center justify-center transition-all duration-500 ${isOnHanger(product.id.toString()) ? "bg-[#B76E79]/5" : "hover:bg-[#1c1c1c]/5"}`}
                      title={isOnHanger(product.id.toString()) ? "Askıdan Çıkar" : "Askıya Ekle"}
                    >
                      <span
                        className={`material-symbols-outlined text-2xl ${isOnHanger(product.id.toString()) ? "text-[#B76E79]" : "text-[#1c1c1c]/45"}`}
                        style={isOnHanger(product.id.toString()) ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        checkroom
                      </span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => window.open(`https://wa.me/905421131641?text=Merhaba, ${product.productName || product.name} modeli hakkında bilgi almak istiyorum.`)}
                  className="w-full py-5 border border-[#1c1c1c]/10 text-[#1c1c1c] font-sans text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#1c1c1c] hover:text-white transition-all duration-500"
                >
                  WHATSAPP İLE BİLGİ ALIN
                </button>
              </div>

              <div className="space-y-2">
                <AccordionSection title="EDİTÖR NOTU" defaultOpen>
                  <div className="font-sans text-sm text-[#1c1c1c] leading-relaxed font-light prose-description max-w-none">
                    {(() => {
                      const desc = product.description_tr || product.description;
                      if (!desc) {
                        return <p>Mina Lidya'nın usta zanaatkarları tarafından {Array.isArray(product.category) && product.category.includes('tesettur-gelinlik') ? 'tesettür' : 'bridal'} koleksiyonu için özel olarak tasarlanan bu eşsiz parça, modern silüeti ve zarif detaylarıyla en özel gününüzde size eşlik edecek.</p>;
                      }

                      let content = typeof desc === 'string' ? desc : (desc.tr || desc.en || Object.values(desc)[0] || "");
                      
                      // If it's a string, render it as HTML (it likely contains the tags the user provided)
                      if (typeof content === 'string' && content.includes('<')) {
                        return <div className="space-y-4" dangerouslySetInnerHTML={{ __html: content }} />;
                      }
                      
                      return <p>{content}</p>;
                    })()}
                  </div>
                </AccordionSection>
                
                <AccordionSection title="ÖLÇÜLER & DİKİM">
                  <div className="space-y-4 font-sans text-sm text-[#1c1c1c] leading-relaxed font-light">
                    <p>Mina Lidya olarak her gelinliğimizi kişinin vücut ölçülerine göre özel olarak dikmekteyiz. Randevu sırasında veya online ölçü formumuzla ileteceğiniz detaylar doğrultusunda, model üzerindeki her detay size özel olarak ayarlanmaktadır.</p>
                    <div className="pt-2">
                        <span className="font-bold">Süreç:</span> 4-8 Hafta / Kişiye Özel Prova
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="BEDEN REHBERİ">
                   <div className="space-y-6 font-sans text-sm text-[#1c1c1c] leading-relaxed font-light">
                    <p>Standart beden tablolarımız yerine, her gelinimiz için "Mina Lidya Fit" standartlarını uyguluyoruz. Ancak referans olması açısından Avrupa (EU) standartlarını baz alabilirsiniz.</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-[#1c1c1c]/5 text-left">
                              <th className="py-2 pr-3 uppercase tracking-wider text-[#1c1c1c]/50 font-medium">EU SIZE</th>
                              <th className="py-2 pr-3 uppercase tracking-wider text-[#1c1c1c]/50 font-medium">GÖĞÜS</th>
                              <th className="py-2 pr-3 uppercase tracking-wider text-[#1c1c1c]/50 font-medium">BEL</th>
                              <th className="py-2 uppercase tracking-wider text-[#1c1c1c]/50 font-medium">BASEN</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ["34", "80 cm", "58 cm", "86 cm"],
                              ["36", "84 cm", "60 cm", "90 cm"],
                              ["38", "88 cm", "62 cm", "94 cm"],
                              ["40", "92 cm", "66 cm", "98 cm"],
                              ["42", "96 cm", "70 cm", "102 cm"],
                            ].map(([size, bust, waist, hips]) => (
                              <tr key={size} className="border-b border-[#1c1c1c]/[0.03]">
                                <td className="py-2 pr-3 font-medium text-[#1c1c1c]/70">{size}</td>
                                <td className="py-2 pr-3 text-[#1c1c1c]/60">{bust}</td>
                                <td className="py-2 pr-3 text-[#1c1c1c]/60">{waist}</td>
                                <td className="py-2 text-[#1c1c1c]/60">{hips}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </AccordionSection>

                <AccordionSection title="TESLİMAT & İADE">
                  <div className="space-y-4 font-sans text-sm text-[#1c1c1c] leading-relaxed font-light">
                    <p>Gelinliklerimiz kişiye özel dikim olduğu için, üretim süreci bittikten sonra ücretsiz kargo veya mağaza teslimi seçenekleriyle sizlere ulaştırılır.</p>
                    <p className="font-bold">İade Politikası:</p>
                    <p>Kişiye özel ölçülerle dikilen ürünlerde, Türk Ticaret Kanunu gereği cayma hakkı ve iade kabul edilmemektedir. Ancak prova sürecinde tüm memnuniyet garantileri Mina Lidya tarafından sağlanmaktadır.</p>
                  </div>
                </AccordionSection>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
