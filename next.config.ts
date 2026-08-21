import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["firebase-admin", "firebase"],
  async redirects() {
    return [
      { source: "/app", destination: "/app/login", permanent: false },
      { source: "/blog", destination: "/articles", permanent: true },
      { source: "/programs", destination: "/learning-areas", permanent: true },
      { source: "/research", destination: "/articles", permanent: true },
      { source: "/research/:slug", destination: "/articles/:slug", permanent: true },
      { source: "/insights", destination: "/articles", permanent: true },
      { source: "/where-deals-break", destination: "/articles", permanent: true },
    ];
  },
};

export default nextConfig;
