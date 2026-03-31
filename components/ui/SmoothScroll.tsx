"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScroll({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return <>{children}</>;
}
