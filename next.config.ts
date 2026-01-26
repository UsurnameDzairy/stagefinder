import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for unpdf to work properly
  serverExternalPackages: ["unpdf"],

  // Empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
