"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScroll({
    children,
}: {
    children: React.ReactNode;
}) {
    const lenisRef = useRef<any>(null);
    const pathname = usePathname();

    // Disable smooth scroll on admin pages — Lenis interferes with fixed drawers and complex layouts
    const isAdmin = pathname?.startsWith("/admin");

    useEffect(() => {
        function update(time: number) {
            lenisRef.current?.lenis?.raf(time);
        }

        // Some GSAP or Framer Motion integrations might need the raf loop
        // but ReactLenis handles the basic loop by default.
    }, []);

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <ReactLenis root ref={lenisRef} options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
            {children}
        </ReactLenis>
    );
}
