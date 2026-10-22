import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    domains: ["images.unsplash.com", "eg0sg3hfmgd6c6ez.public.blob.vercel-storage.com"],
  },

  serverExternalPackages: ["pg"],

  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
