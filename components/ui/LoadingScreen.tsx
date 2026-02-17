"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleReady = () => setIsVisible(false);
        window.addEventListener("app-ready", handleReady);

        // Initial timeout for pages without specific ready logic
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 6000); // 6s fallback for luxury feel

        return () => {
            window.removeEventListener("app-ready", handleReady);
            clearTimeout(timer);
        };
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    key="loading-screen"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: {
                            duration: 1,
                            ease: [0.22, 1, 0.36, 1]
                        }
                    }}
                    className="fixed inset-0 z-[9999] bg-obsidian flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Subtle Aisle Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.04),transparent_70%)]" />

                    <div className="relative flex flex-col items-center">
                        {/* Silhouette Animation Container */}
                        <div className="w-56 h-56 relative mb-12">
                            {/* Minimalist Bride Silhouette SVG */}
                            <motion.svg
                                viewBox="0 0 100 100"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-full h-full text-white/10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.2 }}
                            >
                                {/* stylized dress silhouette - more refined curve */}
                                <motion.path
                                    d="M50 22C46 22 43 25 43 28C43 31 45 33 47 35L41 62L32 88H68L59 62L53 35C55 33 57 31 57 28C57 25 54 22 50 22Z"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="0.75"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 2.2, ease: "easeInOut" }}
                                />

                                {/* Subtle movement hint */}
                                <motion.path
                                    d="M38 65Q50 70 62 65"
                                    stroke="rgba(212,175,55,0.15)"
                                    strokeWidth="0.5"
                                    strokeDasharray="2 4"
                                    animate={{
                                        strokeDashoffset: [0, -6],
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                />
                            </motion.svg>

                            {/* Animated Walk Ripple */}
                            <motion.div
                                className="absolute inset-0 rounded-full border border-resonance-amber/10"
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1.4, opacity: [0, 0.2, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "circOut" }}
                            />
                        </div>

                        {/* Typography */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="text-center"
                        >
                            <h2 className="font-serif text-[13px] tracking-[0.5em] text-white/40 mb-4 uppercase font-light">
                                RE : GALIA
                            </h2>
                            <div className="flex gap-1.5 justify-center">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-[3px] h-[3px] rounded-full bg-resonance-amber/30"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.3, 0.8, 0.3]
                                        }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Grainy Noise Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
