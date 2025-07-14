import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrites for local development to proxy API requests to the Python backend
  // This is ignored in Vercel deployment where vercel.json handles routing
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
