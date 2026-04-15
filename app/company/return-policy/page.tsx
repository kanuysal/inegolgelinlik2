"use client";

import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default function ReturnPolicyPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#B76E79] mb-6 font-bold">
            Mina Lidya Couture
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-[#1c1c1c] leading-[1.15] lowercase first-letter:uppercase">
            İptal ve İade Koşulları
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-12">
            {/* Scope */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                KAPSAM
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6">
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  Bu iade politikası sadece <strong className="text-[#1c1c1c] font-normal">Mina Lidya</strong> butiklerinden veya resmi web sitemiz üzerinden yapılan doğrudan satın alımlar için geçerlidir. Kişiye özel dikim süreçleri bu politikanın ana odak noktasıdır.
                </p>
              </div>
            </div>

            {/* Return Window */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                İADE VE DEĞİŞİM SÜRESİ
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6 space-y-4">
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  Hazır giyim koleksiyonumuza ait ürünlerde, teslimat tarihinden itibaren <strong className="text-[#1c1c1c] font-normal">14 gün</strong> içerisinde iade veya değişim talebinde bulunabilirsiniz. Hijyen kuralları gereği aksesuar ve iç giyim ürünlerinde iade kabul edilmemektedir.
                </p>
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  İade sürecini başlatmak için <a href="mailto:info@minalidya.wedding" className="text-[#1c1c1c] underline underline-offset-4 decoration-[#1c1c1c]/20 hover:decoration-[#1c1c1c]/60 transition-colors">info@minalidya.wedding</a> adresine mail atabilir veya +90 532 247 64 62 numaralı WhatsApp hattımızdan bizimle iletişime geçebilirsiniz.
                </p>
              </div>
            </div>

            {/* custom production */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                KİŞİYE ÖZEL DİKİM
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6 space-y-4">
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  Türk Ticaret Kanunu mesafeli satış sözleşmesi gereğince; tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan (kişiye özel ölçü ile dikilen) ürünlerde cayma hakkı bulunmamaktadır. Ancak Mina Lidya olarak, prova sürecinde memnuniyetinizi garanti altına almak için tüm tadilat işlemlerini ücretsiz gerçekleştirmekteyiz.
                </p>
              </div>
            </div>

            {/* Condition Requirements */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                ŞARTLAR
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6 space-y-4">
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  İade edilecek ürünlerin kullanılmamış, tadilat görmemiş, orijinal etiketleri ve ambalajı ile birlikte eksiksiz olarak gönderilmesi gerekmektedir. Kullanım izi taşıyan veya zarar görmüş ürünlerin iadesi kabul edilmez.
                </p>
              </div>
            </div>

            {/* Refund Process */}
            <div>
              <h2 className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#1c1c1c]/30 mb-4 font-light">
                GERİ ÖDEME
              </h2>
              <div className="border-t border-[#1c1c1c]/10 pt-6 space-y-4">
                <p className="font-sans text-[14px] text-[#1c1c1c]/70 leading-relaxed font-light">
                  İade onaylandıktan sonra, ödemeniz 7-10 iş günü içerisinde orijinal ödeme yönteminize geri yüklenir. Bankanıza bağlı olarak bu sürenin yansıması değişiklik gösterebilir.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-4 border-t border-[#1c1c1c]/10">
              <p className="font-sans text-[13px] text-[#1c1c1c]/40 leading-relaxed font-light">
                Bir sorunuz mu var?{" "}
                <Link href="/appointment" className="text-[#1c1c1c]/60 underline underline-offset-4 decoration-[#1c1c1c]/20 hover:decoration-[#1c1c1c]/60 transition-colors">
                  Bize ulaşın
                </Link>{" "}
                — size yardımcı olmaktan mutluluk duyarız.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
