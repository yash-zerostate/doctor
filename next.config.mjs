/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // TEMPORARY: testing Preta's onboarding "Verify setup" CSP check. Report-only reports but
  // blocks nothing, so the site keeps working. Remove this headers() block after the test.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: "script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
