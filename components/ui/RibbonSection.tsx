'use client';
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RibbonSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const totalFrames = 300;
  const imagePath = "/assets/animations/ribbon/";

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i <= totalFrames; i++) {
        const img = new Image();
        const frameNum = i.toString().padStart(3, '0');
        img.src = `${imagePath}${frameNum}.webp`;
        img.onload = () => {
            loadedCount++;
            if (loadedCount > totalFrames) { // 301 frames
                setIsLoaded(true);
            }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount > totalFrames) {
            setIsLoaded(true);
          }
        };
        loadedImages[i] = img;
    }
    setImages(loadedImages);
  }, []);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const render = (index: number) => {
      const img = images[index];
      if (img) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    // Render first frame immediately
    render(0);

    const scrollObj = { frame: 0 };
    const tl = gsap.to(scrollObj, {
      frame: totalFrames,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      },
      onUpdate: () => {
        render(Math.floor(scrollObj.frame));
      }
    });

    // Important for Next.js hydration issues with ScrollTrigger
    const refreshAndRender = () => {
      ScrollTrigger.refresh();
      render(0);
    };

    const timer = setTimeout(refreshAndRender, 100);

    return () => {
      clearTimeout(timer);
      tl.kill();
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === containerRef.current) st.kill();
      });
    };
  }, [isLoaded, images]);

  return (
    <div 
      ref={containerRef}
      className="w-full py-20 md:py-32 overflow-hidden relative bg-white"
    >
      <div className="max-w-[1920px] mx-auto px-0 relative">
        <div className="flex justify-center items-center min-h-[400px] md:min-h-[600px]">
            <canvas
                ref={canvasRef}
                width={1920}
                height={600}
                className="w-full h-auto block max-w-[1600px] pointer-events-none"
            />
        </div>

        {/* ── Content Overlay ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 mix-blend-difference z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto"
          >
            <p className="text-[11px] uppercase tracking-[0.5em] text-white/80 mb-8 font-bold">Online Couture</p>
            <h2 className="text-4xl md:text-7xl font-serif font-light leading-tight mb-12 text-white">
              Mesafe Tanımayan<br />Özel Dikim Sanatı
            </h2>
            <Link href="/appointment" className="inline-block px-12 py-5 bg-white text-black hover:bg-black hover:text-white transition-all duration-500 text-[12px] font-bold uppercase tracking-[0.25em] shadow-2xl">
              RANDEVU ALIN
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
