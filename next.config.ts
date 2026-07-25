import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force WASM SWC on platforms without native binaries (Termux/Android)
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
