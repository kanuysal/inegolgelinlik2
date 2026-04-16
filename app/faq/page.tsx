"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_DATA = [
  {
    category: "Cooperation",
    label: "İş Birliği Süreci",
    questions: [
      {
        q: "Nasıl resmi partner olabiliriz?",
        a: "İletişim sayfamızdaki formu doldurarak veya doğrudan bizimle iletişime geçerek partnerlik sürecini başlatabilirsiniz. Bölge sorumlumuz sizinle irtibata geçecektir."
      },
      {
        q: "Minimum sipariş adedi nedir?",
        a: "Toptan iş birliği için başlangıç sipariş adedi genellikle 7 birimdir. Bu, butiğinizde yeterli çeşitlilik sunulmasını sağlar."
      },
      {
        q: "Üretim nerede yapılıyor?",
        a: "Tüm tasarımlarımız Bursa/İnegöl'deki kendi atölyemizde, usta sanatkarlarımız tarafından el işçiliği ile üretilmektedir."
      }
    ]
  },
  {
    category: "Production",
    label: "Üretim ve Kalite",
    questions: [
      {
        q: "Hangi malzemeleri kullanıyorsunuz?",
        a: "Japonya, Avrupa ve Türkiye'nin en kaliteli kumaşlarını, kristal işlemeler ve el yapımı dantellerle birleştiriyoruz."
      },
      {
        q: "Özel dikim (Haute Couture) yapıyor musunuz?",
        a: "Evet, Mina Lidya olarak kişiye özel tasarım ve dikim hizmeti en güçlü olduğumuz alanlardan biridir."
      },
      {
        q: "Üretim süresi ne kadardır?",
        a: "Standart üretim süremiz 3 ila 8 hafta arasında değişmektedir. Detaylı modellerde bu süre işçiliğe bağlı olarak farklılık gösterebilir."
      }
    ]
  }
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState("Cooperation");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (q: string) => {
    setOpenItems(prev => 
      prev.includes(q) ? prev.filter(i => i !== q) : [...prev, q]
    );
  };

  const currentCategory = FAQ_DATA.find(d => d.category === activeTab);

  return (
    <main className="min-h-screen bg-white text-[#1c1c1c] font-sans">
      <Navbar />

      <section className="pt-40 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-serif tracking-tighter text-center mb-16">
          Sıkça Sorulan Sorular
        </h1>

        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-16 border-b border-[#1c1c1c]/5 pb-4">
          {FAQ_DATA.map((tab) => (
            <button
              key={tab.category}
              onClick={() => setActiveTab(tab.category)}
              className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative py-2 ${
                activeTab === tab.category ? "text-[#B76E79]" : "text-[#1c1c1c]/40 hover:text-[#1c1c1c]"
              }`}
            >
              {tab.label}
              {activeTab === tab.category && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B76E79]" />
              )}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {currentCategory?.questions.map((item, idx) => (
                <div key={idx} className="border-b border-[#1c1c1c]/5 overflow-hidden">
                  <button
                    onClick={() => toggleItem(item.q)}
                    className="w-full py-6 flex items-center justify-between text-left group"
                  >
                    <span className="text-xl md:text-2xl font-serif tracking-tight pr-8">
                      {item.q}
                    </span>
                    <span className={`material-symbols-outlined transition-transform duration-500 ${openItems.includes(item.q) ? "rotate-45" : ""}`}>
                      add
                    </span>
                  </button>
                  <AnimatePresence>
                    {openItems.includes(item.q) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="pb-8 text-[#1c1c1c]/60 leading-relaxed font-light text-lg">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Contact CTA */}
        <div className="mt-32 p-12 bg-[#F9F6F3] text-center rounded-sm">
          <h3 className="text-2xl font-serif mb-4 italic">Başka bir sorunuz mu var?</h3>
          <p className="text-[#1c1c1c]/40 mb-8 max-w-md mx-auto">Uzman ekibimiz size yardımcı olmak için burada. Randevu veya partnerlik talepleriniz için bize ulaşın.</p>
          <button className="px-8 py-3 bg-[#1c1c1c] text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#B76E79] transition-colors duration-500">
            Daha Fazla Bilgi Al
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
