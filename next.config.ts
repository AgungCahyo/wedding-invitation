import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
        search: "?v=20260820",
      },
    ],
    // Add Supabase storage hostname for external images
    domains: [
      // Extract hostname from NEXT_PUBLIC_SUPABASE_URL
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname]
        : []),
    ].filter(Boolean),
  },
};

export default nextConfig;
