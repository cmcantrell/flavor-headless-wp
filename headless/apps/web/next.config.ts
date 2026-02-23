import type { NextConfig } from "next";
import { resolve, join } from "node:path";

function buildRemotePatterns() {
  const patterns: {
    protocol: "https" | "http";
    hostname: string;
    pathname: string;
  }[] = [
    { protocol: "https", hostname: "wordpress.test", pathname: "/**" },
    { protocol: "https", hostname: "localhost", pathname: "/**" },
    // Gravatar for author/comment avatars
    { protocol: "https", hostname: "secure.gravatar.com", pathname: "/**" },
    { protocol: "https", hostname: "gravatar.com", pathname: "/**" },
  ];

  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
  if (wpUrl) {
    try {
      const url = new URL(wpUrl);
      patterns.push({
        protocol: url.protocol.replace(":", "") as "https" | "http",
        hostname: url.hostname,
        pathname: "/**",
      });
    } catch {
      // Invalid URL, skip
    }
  }

  const extraDomains = process.env.IMAGE_DOMAINS;
  if (extraDomains) {
    extraDomains.split(",").forEach((domain) => {
      const trimmed = domain.trim();
      if (trimmed) {
        patterns.push({
          protocol: "https",
          hostname: trimmed,
          pathname: "/**",
        });
      }
    });
  }

  return patterns;
}

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@flavor/core", "@flavor/woo"],
  outputFileTracingRoot: resolve(join(__dirname, "../../")),
  images: {
    remotePatterns: buildRemotePatterns(),
    unoptimized: process.env.OPTIMIZE_IMAGES !== "true",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
