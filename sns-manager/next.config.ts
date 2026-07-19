import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ルートに複数のlockfileがあるため、このアプリのディレクトリをルートに固定
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
