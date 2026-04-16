'use client';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Observer } from 'gsap/dist/Observer';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Observer);
}

const MARQUEE_VIDEOS = [
  "/videos/sliders/sliders-1.mp4",
  "/videos/sliders/sliders-2.mp4",
  "/videos/sliders/sliders-3.mp4",
  "/videos/sliders/sliders-4.mp4",
  "/videos/sliders/sliders-5.mp4",
  "/videos/sliders/sliders-6.mp4",
  "/videos/sliders/sliders-7.mp4",
  "/videos/sliders/sliders-8.mp4",
  "/videos/sliders/sliders-9.mp4",
];

export default function HorizontalVideoGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);
  
  const state = useRef({
    lerp: 0.1,
    current: 0,
    target: 0,
    drift1: 0,
    drift2: 0,
    totalWidth: 0,
  });

  useEffect(() => {
    if (!track1Ref.current || !track2Ref.current || !containerRef.current) return;

    const track1 = track1Ref.current;
    const track2 = track2Ref.current;
    const container = containerRef.current;

    const setup = () => {
      const item = track1.querySelector('.video-item') as HTMLElement;
      if (!item) return;
      const gap = 24; 
      state.current.totalWidth = (item.offsetWidth + gap) * MARQUEE_VIDEOS.length;
    };

    setup();
    window.addEventListener('resize', setup);

    const driftSpeed = 0.8;
    const maxParallaxShift = 100;
    const viewportCenter = window.innerWidth * 0.5;

    let frameId: number;
    const render = () => {
      if (state.current.totalWidth === 0) {
        frameId = requestAnimationFrame(render);
        return;
      }

      const wrap = gsap.utils.wrap(-state.current.totalWidth, 0);

      state.current.drift1 -= driftSpeed;
      state.current.drift2 += driftSpeed;
      state.current.current = gsap.utils.interpolate(state.current.current, state.current.target, state.current.lerp);

      const x1 = wrap(state.current.current + state.current.drift1);
      const x2 = wrap(-state.current.current + state.current.drift2);

      gsap.set(track1, { x: x1 });
      gsap.set(track2, { x: x2 });

      // Apply Parallax via direct DOM selection for stability
      const applyParallax = (track: HTMLElement) => {
        const items = track.querySelectorAll('.video-item');
        items.forEach((item) => {
          const rect = item.getBoundingClientRect();
          const center = rect.left + rect.width * 0.5;
          const t = (center - viewportCenter) / viewportCenter;
          const clampedT = Math.max(-1.5, Math.min(1.5, t));
          const shiftX = -clampedT * maxParallaxShift;
          
          const vid = item.querySelector('video');
          if (vid) {
            gsap.set(vid, { 
                xPercent: (shiftX / rect.width) * 100 - 50, 
                scale: 1.5 
            });
          }
        });
      };

      applyParallax(track1);
      applyParallax(track2);

      frameId = requestAnimationFrame(render);
    };

    render();

    const st = ScrollTrigger.create({
      trigger: container,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        state.current.target = -self.progress * 4000;
      }
    });

    const obs = Observer.create({
      target: container,
      type: "wheel,touch,pointer",
      onDrag: (self) => {
        state.current.target += self.deltaX * 3;
      }
    });

    return () => {
      window.removeEventListener('resize', setup);
      cancelAnimationFrame(frameId);
      st.kill();
      obs.kill();
    };
  }, []);

  const renderItems = (prefix: string) => (
    [...MARQUEE_VIDEOS, ...MARQUEE_VIDEOS, ...MARQUEE_VIDEOS].map((src, i) => (
      <div 
        key={`${prefix}-${i}`} 
        className="video-item relative aspect-square h-[30vh] bg-neutral-900 overflow-hidden shadow-2xl flex-shrink-0 group pointer-events-none"
        style={{ minWidth: '30vh' }}
      >
        <video 
          src={src} autoPlay muted loop playsInline 
          className="w-[250%] h-full object-cover grayscale group-hover:grayscale-0 transition-[filter] duration-1000 origin-center left-1/2 absolute"
          style={{ transform: 'translateX(-50%)' }}
        />
        <div className="absolute inset-0 border border-white/5 pointer-events-none" />
      </div>
    ))
  );

  return (
    <section 
      ref={containerRef}
      className="w-full bg-black relative overflow-hidden py-40 flex flex-col gap-16"
    >
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-black via-transparent to-black" />
      
      <div className="flex items-center overflow-hidden h-[30vh]">
        <div ref={track1Ref} className="flex gap-6 px-10 items-center whitespace-nowrap will-change-transform">
          {renderItems('r1')}
        </div>
      </div>

      <div className="flex items-center overflow-hidden h-[30vh]">
        <div ref={track2Ref} className="flex gap-6 px-10 items-center whitespace-nowrap will-change-transform">
          {renderItems('r2')}
        </div>
      </div>
    </section>
  );
}
