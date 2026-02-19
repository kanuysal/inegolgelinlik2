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

    // Scroll to top on route change
    useEffect(() => {
        if (lenisRef.current?.lenis) {
            lenisRef.current.lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <ReactLenis root ref={lenisRef} options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
            {children}
        </ReactLenis>
    );
}
