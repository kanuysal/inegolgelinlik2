"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      {/* Spinning Logo */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
        className="relative"
      >
        <img
          src="/images/loading_logo.png"
          alt="Loading..."
          className="w-32 h-32 md:w-40 md:h-40 object-contain"
        />
      </motion.div>

      {/* Optional: Pulsing glow effect behind logo */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-40 h-40 md:w-48 md:h-48 bg-primary/20 rounded-full blur-2xl -z-10"
      />
    </div>
  );
}

/**
 * Smaller inline loading spinner for use within components
 */
export function InlineLoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={sizeClasses[size]}
      >
        <img
          src="/images/loading_logo.png"
          alt="Loading..."
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
}
