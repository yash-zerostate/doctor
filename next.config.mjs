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
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: ; connect-src 'self' https://loader.pretasystems.com https://app.pretasystems.com https: wss: ; style-src 'self' 'unsafe-inline' https: ; img-src 'self' data: https: ; font-src 'self' https: data:",

          },
        ],
      },
    ];
  },
};

export default nextConfig;
