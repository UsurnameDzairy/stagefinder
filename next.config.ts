import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for PDF libraries to work properly
  serverExternalPackages: ["unpdf", "pdf-parse"],

  // Empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
