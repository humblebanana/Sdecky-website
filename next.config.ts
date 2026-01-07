import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable cache components to allow dynamic admin routes with authentication
  cacheComponents: false,
};

export default nextConfig;
