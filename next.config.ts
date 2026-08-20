import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
        search: "?v=20260820",
      },
    ],
  },
};

export default nextConfig;
