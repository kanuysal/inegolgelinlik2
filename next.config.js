/** @type {import('next').NextConfig} */
const nextConfig = {
  // M4 fix: Explicitly configure CSRF allowed origins for server actions
  experimental: {
    serverActions: {
      allowedOrigins: [
        'regalia-scroll.vercel.app',
        'localhost:3000',
      ],
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.stockist.galialahav.com" },
      // L2 fix: Restrict to our specific Supabase project instead of wildcard *.supabase.co
      { protocol: "https", hostname: "acfsgzumjwqatzqureuq.supabase.co" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://ucarecdn.com https://cdn.shopify.com https://www.galialahav.com https://images.unsplash.com https://cdn.stockist.galialahav.com https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.kustomerapp.com https://stockist.galialahav.com https://*.upstash.io https://api.stripe.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
