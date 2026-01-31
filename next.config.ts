import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for PDF libraries to work properly
  serverExternalPackages: ["unpdf", "pdf-parse"],

  // Enable standalone output for Docker
  output: "standalone",

  // Empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
