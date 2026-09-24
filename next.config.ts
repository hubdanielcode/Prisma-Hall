import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com"],
  },

  serverExternalPackages: ["pg"],

  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
