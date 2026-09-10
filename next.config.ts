import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets `next dev` serve HMR/static assets when the app is previewed through a
  // Cloudflare quick tunnel (`cloudflared tunnel --url ...`) instead of localhost.
  // Dev-only — has no effect on production builds.
  allowedDevOrigins: ["*.trycloudflare.com"],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com",
            "form-action 'self' https://accounts.google.com",
            "frame-src 'self' https://accounts.google.com",
            "frame-ancestors 'none'",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
