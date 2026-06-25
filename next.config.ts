import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["firebase-admin", "firebase"],
};

export default nextConfig;
