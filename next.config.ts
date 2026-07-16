import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["firebase-admin", "firebase"],
  async redirects() {
    return [{ source: "/app", destination: "/app/login", permanent: false }];
  },
};

export default nextConfig;
