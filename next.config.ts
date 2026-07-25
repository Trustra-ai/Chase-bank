import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    forceSwcTransforms: true,
  },

  // Allow Hot Module Replacement (HMR) when accessing
  // the dev server from another device on your local network.
  allowedDevOrigins: [
    "172.20.10.4",
  ],
};

export default nextConfig;
