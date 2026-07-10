import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // モノレポ内の独立アプリとして、ワークスペースのルートをこのディレクトリに固定する
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
