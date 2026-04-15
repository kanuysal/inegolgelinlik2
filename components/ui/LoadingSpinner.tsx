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
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="relative w-48 h-48 flex items-center justify-center"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <path
              id="circlePath"
              d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
            />
          </defs>
          <text className="font-serif text-[8px] uppercase tracking-[0.2em] fill-[#1c1c1c]">
            <textPath href="#circlePath" startOffset="0%">
              MİNA LİDYA • MİNA LİDYA • MİNA LİDYA • MİNA LİDYA •
            </textPath>
          </text>
        </svg>
        {/* Center Symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#B76E79] rounded-full" />
        </div>
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
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className={sizeClasses[size]}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <path
              id="circlePathInline"
              d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
            />
          </defs>
          <text className="font-serif text-[10px] uppercase tracking-[0.1em] fill-[#1c1c1c]/40">
            <textPath href="#circlePathInline" startOffset="0%">
              MİNA LİDYA • MİNA LİDYA •
            </textPath>
          </text>
        </svg>
      </motion.div>
    </div>
  );
}
