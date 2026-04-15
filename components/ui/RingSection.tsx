'use client';
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import { motion, AnimatePresence } from 'framer-motion';

const SLOGANS = [
  { title: "Kına Organizasyonu" },
  { title: "İnegöl Mağaza" },
  { title: "Valencia Atelier" },
  { title: "Haute Couture" },
  { title: "Modern Tasarımlar" }
];

export default function RingSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const totalFrames = 250;
  const imagePath = "/assets/animations/ring/";

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i <= totalFrames; i++) {
        const img = new Image();
        const frameNum = i.toString().padStart(3, '0');
        img.src = `${imagePath}${frameNum}.webp`;
        img.onload = () => {
            loadedCount++;
            if (loadedCount >= totalFrames) setIsLoaded(true);
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount >= totalFrames) setIsLoaded(true);
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

    render(0);

    const scrollObj = { frame: 0 };
    const tl = gsap.to(scrollObj, {
      frame: totalFrames,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 0.5,
      },
      onUpdate: () => render(Math.floor(scrollObj.frame))
    });

    return () => {
      tl.kill();
    };
  }, [isLoaded, images]);

  const itemWidth = 1000; 
  const totalWidth = SLOGANS.length * itemWidth;

  return (
    <div ref={containerRef} className="w-full bg-white overflow-hidden py-40 relative">
      <div className="flex items-center justify-center min-h-[50vh] md:min-h-[70vh]">
        <canvas
          ref={canvasRef}
          width={1000}
          height={1000}
          className="max-w-full max-h-full object-contain pointer-events-none opacity-80"
          style={{ height: 'auto', maxWidth: '800px' }}
        />
      </div>

      {/* ── Tilted SVG Marquee Ribbon ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-20">
        <svg 
          className="w-[250%] h-[20vh] mix-blend-difference"
          style={{ transform: 'rotate(-15deg)', minWidth: '250%' }}
          viewBox={`0 0 ${totalWidth} 150`}
          preserveAspectRatio="xMidYMid slice"
        >
          <style>
            {`
              @keyframes marqueeX {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              .marquee-group {
                animation: marqueeX 120s linear infinite;
              }
            `}
          </style>
          <defs>
            <mask id="marquee-mask">
              <rect x="0" y="0" width={totalWidth * 2} height="150" fill="white" />
              <g className="marquee-group">
                {/* Two sets for perfect looping */}
                {[0, totalWidth].map((offset) => (
                  <g key={offset} transform={`translate(${offset}, 0)`}>
                    {SLOGANS.map((slogan, i) => (
                      <text
                        key={i}
                        x={i * itemWidth}
                        y="95"
                        fill="black"
                        className="font-serif uppercase tracking-[0.3em] font-bold"
                        style={{ fontSize: '85px' }}
                      >
                        {slogan.title}
                      </text>
                    ))}
                  </g>
                ))}
              </g>
            </mask>
          </defs>

          {/* The Black Ribbon with Hollow Text Holes — No Borders */}
          <rect x="0" y="0" width={totalWidth * 2} height="150" fill="black" fillOpacity="0.5" mask="url(#marquee-mask)" />
        </svg>
      </div>
    </div>
  );
}
