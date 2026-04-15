"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useHanger } from "@/lib/hanger-context";
import { fetchProducts, getImageUrl, MinaLidyaProduct } from "@/lib/minalidya-api";
import { thumb, PLACEHOLDER_IMG } from "@/lib/image";

export default function ProvaListesiPage() {
  const { ids, removeId } = useHanger();
  const [products, setProducts] = useState<MinaLidyaProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const all = await fetchProducts();
      // Filter products that are in the hanger
      const inHanger = all.filter(p => ids.includes(p.id.toString()) || ids.includes(p.slug || ""));
      setProducts(inHanger);
      setLoading(false);
    }
    loadProducts();
  }, [ids]);

  const handleWhatsApp = () => {
    if (products.length === 0) return;
    
    const productNames = products.map((p, i) => `${i + 1}. ${p.productName || p.name} (Ref: ${p.id})`).join("\n");
    const message = encodeURIComponent(
      `Merhaba Mina Lidya Bridal,\n\nProva listemdeki aşağıdaki modelleri denemek için randevu talep etmek istiyorum:\n\n${productNames}\n\nDönüşünüzü bekliyorum.`
    );
    window.open(`https://wa.me/905421131641?text=${message}`, "_blank");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <main className="min-h-screen bg-[#fafafc] flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-[#1c1c1c] mb-4">Prova Listesi</h1>
          <p className="text-sm text-[#1c1c1c]/40 uppercase tracking-[0.2em]">Seçtiğiniz modelleri burada görebilir ve randevu planlayabilirsiniz.</p>
        </header>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#1c1c1c]/5">
             <span className="material-symbols-outlined text-6xl text-[#1c1c1c]/10 mb-6" style={{ fontVariationSettings: "'wght' 100" }}>checkroom</span>
             <p className="text-[#1c1c1c]/40 mb-8 lowercase first-letter:uppercase">Henüz listenize bir model eklemediniz.</p>
             <Link href="/shop" className="px-8 py-3 bg-[#1c1c1c] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#B76E79] transition-colors text-center">
               Modelleri İncele
             </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence>
                {products.map((product) => {
                   const image = product.images?.[0] ? getImageUrl(product.images[0]) : PLACEHOLDER_IMG;
                   return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group flex gap-6 bg-white p-4 border border-[#1c1c1c]/5 hover:border-[#B76E79]/20 transition-all duration-500 shadow-sm hover:shadow-xl"
                    >
                      <div className="w-24 h-32 md:w-32 md:h-44 flex-shrink-0 overflow-hidden bg-slate-50">
                        <img 
                          src={thumb(image, 400)} 
                          alt={product.productName || "Model"} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-col justify-between py-2 flex-grow">
                        <div>
                          <p className="text-[10px] text-[#B76E79] font-bold tracking-[0.2em] uppercase mb-1">{product.category?.[0] || "Couture"}</p>
                          <h3 className="text-xl md:text-2xl font-serif text-[#1c1c1c] mb-2">{product.productName || product.name}</h3>
                          <p className="text-xs text-[#1c1c1c]/30">Ürün Kodu: {product.id}</p>
                        </div>
                        <div className="flex items-center justify-between">
                           <button 
                             onClick={() => removeId(product.id.toString())}
                             className="text-[10px] text-[#1c1c1c]/30 hover:text-red-500 font-bold uppercase tracking-widest transition-colors"
                           >
                             Kaldır
                           </button>
                           <Link 
                             href={`/shop/${product.slug || product.id}`}
                             className="text-[10px] text-[#1c1c1c] hover:text-[#B76E79] font-bold uppercase tracking-widest transition-colors underline underline-offset-4"
                           >
                             Detaylı Gör
                           </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 sticky bottom-8 flex flex-col items-center gap-4"
            >
               <button 
                 onClick={handleWhatsApp}
                 className="group w-full md:w-auto px-12 py-5 bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl hover:scale-[1.02]"
               >
                 <span className="material-symbols-outlined">send_to_mobile</span>
                 <span className="text-[11px] font-bold uppercase tracking-[0.25em]">Hepsini Denemek İstiyorum (WhatsApp)</span>
               </button>
               <p className="text-[10px] text-[#1c1c1c]/30 uppercase tracking-[0.15em] text-center">
                 Tıklayarak seçtiğiniz ürünlerle birlikte randevu talebinde bulunabilirsiniz.
               </p>
            </motion.div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
