import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hnhiomyxdfnxogqckncq.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.openfoodfacts.org",
      },
    ],
  },
  // Proxy API calls through the frontend origin so the auth cookie is set first-party
  // to the Vercel domain (otherwise it lives on the Render domain and the proxy.ts
  // middleware can't read it). Server-side rewrite -> no CORS, no third-party cookies.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://localhost:4000"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
