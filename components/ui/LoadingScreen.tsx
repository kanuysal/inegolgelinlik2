"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleReady = () => setIsVisible(false);
        window.addEventListener("app-ready", handleReady);

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 4000);

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
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1]
                        }
                    }}
                    className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
                >
                    <div className="relative flex flex-col items-center">
                        {/* RE:GALIA Logo Animation */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* Top line */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="w-32 h-[1px] bg-[#1c1c1c] mx-auto mb-6 origin-center"
                            />

                            {/* Logo text - letter by letter reveal */}
                            <div className="overflow-hidden">
                                <motion.h1
                                    initial={{ y: 40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="font-serif text-[2.5rem] tracking-[0.35em] text-[#1c1c1c] font-light uppercase text-center"
                                >
                                    MİNA LİDYA
                                </motion.h1>
                            </div>

                            {/* Bottom line */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="w-32 h-[1px] bg-[#1c1c1c] mx-auto mt-6 origin-center"
                            />

                            {/* Tagline */}
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
                                className="font-sans text-[10px] tracking-[0.5em] text-[#1c1c1c]/40 mt-8 uppercase text-center font-light"
                            >
                                Luxury Bridal & Haute Couture
                            </motion.p>
                        </motion.div>

                        {/* Minimal loading indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4 }}
                            className="mt-16"
                        >
                            <motion.div
                                className="w-8 h-[1px] bg-[#1c1c1c]/20"
                                animate={{
                                    scaleX: [0.3, 1, 0.3],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
