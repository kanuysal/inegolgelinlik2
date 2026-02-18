"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useRef } from "react";

export default function SmoothScroll({
    children,
}: {
    children: React.ReactNode;
}) {
    const lenisRef = useRef<any>(null);

    useEffect(() => {
        function update(time: number) {
            lenisRef.current?.lenis?.raf(time);
        }

        // Some GSAP or Framer Motion integrations might need the raf loop
        // but ReactLenis handles the basic loop by default.
    }, []);

    return (
        <ReactLenis root ref={lenisRef} options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
            {children}
        </ReactLenis>
    );
}
