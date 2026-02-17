import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/en",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/:locale(fr|ar|de|es|it|pt|zh|ja|ko|ru|nl|tr)",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
