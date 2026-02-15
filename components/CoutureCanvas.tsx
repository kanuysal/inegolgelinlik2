"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useSpring, useMotionValueEvent } from "framer-motion";

interface CoutureCanvasProps {
  totalFrames?: number;
  framePrefix?: string;
  frameExtension?: string;
}

function padFrame(n: number): string {
  return String(n).padStart(3, "0");
}

/**
 * CoutureCanvas — Standalone scroll-linked frame animation component.
 *
 * Usage:
 *   <CoutureCanvas totalFrames={192} framePrefix="/frames/frame_" frameExtension=".jpg" />
 *
 * Wraps its own scroll container (500vh) and renders frames
 * on a sticky <canvas> synced to scroll progress via useSpring.
 */
export default function CoutureCanvas({
  totalFrames = 192,
  framePrefix = "/frames/frame_",
  frameExtension = ".jpg",
}: CoutureCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.0001,
  });

  /* ── Draw a frame with cover-fit + DPR ── */
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imagesRef.current[index];
    if (!canvas || !ctx || !img || !img.complete || !img.naturalWidth) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  }, []);

  /* ── Preload all frames (0-indexed) ── */
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];
    let cancelled = false;

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = `${framePrefix}${padFrame(i)}${frameExtension}`;
      img.onload = () => {
        if (cancelled) return;
        loaded++;
        setLoadProgress(Math.round((loaded / totalFrames) * 100));
        if (loaded >= totalFrames) {
          setIsLoading(false);
          drawFrame(0);
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        loaded++;
        setLoadProgress(Math.round((loaded / totalFrames) * 100));
        if (loaded >= totalFrames) setIsLoading(false);
      };
      images.push(img);
    }
    imagesRef.current = images;
    return () => {
      cancelled = true;
    };
  }, [totalFrames, framePrefix, frameExtension, drawFrame]);

  /* ── Scroll → frame ── */
  useMotionValueEvent(smoothProgress, "change", (v) => {
    const frameIndex = Math.min(
      totalFrames - 1,
      Math.max(0, Math.floor(v * (totalFrames - 1)))
    );
    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
    }
  });

  /* ── Resize ── */
  useEffect(() => {
    const handleResize = () => drawFrame(currentFrameRef.current);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-obsidian">
          <p className="font-serif text-2xl tracking-[0.3em] text-white/60 mb-8 uppercase">
            Preparing the Atelier&hellip;
          </p>
          <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-muted/60 to-champagne/40 transition-all duration-300 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="mt-4 font-sans text-xs tracking-widest text-white/30">
            {loadProgress}%
          </p>
        </div>
      )}

      <div ref={containerRef} style={{ height: "500vh" }} className="relative">
        <canvas
          ref={canvasRef}
          className="sticky top-0 left-0 w-screen h-screen"
          style={{ display: isLoading ? "none" : "block" }}
        />
      </div>
    </>
  );
}
